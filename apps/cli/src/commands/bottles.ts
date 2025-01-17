import program from "@peated/cli/program";
import { db } from "@peated/server/db";
import { bottles, reviews, tastings } from "@peated/server/db/schema";
import { pushJob } from "@peated/server/jobs/client";
import { findEntity } from "@peated/server/lib/bottleFinder";
import { formatCategoryName } from "@peated/server/lib/format";
import { createCaller } from "@peated/server/trpc/router";
import { and, asc, eq, inArray, isNull, ne, sql } from "drizzle-orm";

const subcommand = program.command("bottles");

subcommand
  .command("generate-descriptions")
  .description("Generate bottle descriptions")
  .argument("[bottleIds...]")
  .option("--only-missing")
  .action(async (bottleIds, options) => {
    const step = 1000;
    const baseQuery = db
      .select({ id: bottles.id })
      .from(bottles)
      .where(
        bottleIds.length
          ? inArray(bottles.id, bottleIds)
          : options.onlyMissing
            ? isNull(bottles.description)
            : undefined,
      )
      .orderBy(asc(bottles.id));

    let hasResults = true;
    let offset = 0;
    while (hasResults) {
      hasResults = false;
      const query = await baseQuery.offset(offset).limit(step);
      for (const { id } of query) {
        console.log(`Generating description for Bottle ${id}.`);
        await pushJob("GenerateBottleDetails", { bottleId: id });
        hasResults = true;
      }
      offset += step;
    }
  });

subcommand
  .command("create-missing")
  .description("Create missing bottles")
  .action(async (options) => {
    console.log(`Pushing job [CreateMissingBottles].`);
    await pushJob("CreateMissingBottles");
  });

subcommand
  .command("fix-bad-entities")
  .description("Fix bottles with bad entities")
  .action(async (options) => {
    const results = await db
      .select({ bottle: bottles, review: reviews })
      .from(bottles)
      .innerJoin(
        reviews,
        and(
          eq(reviews.bottleId, bottles.id),
          ne(reviews.name, bottles.fullName),
        ),
      );

    const systemUser = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.username, "dcramer"),
    });
    if (!systemUser) throw new Error("Unable to identify system user");

    const caller = createCaller({
      user: systemUser,
    });

    for (const { bottle, review } of results) {
      if (bottle.fullName.indexOf(review.name) !== 0) {
        const entity = await findEntity(review.name);
        if (!entity) {
          console.warn(
            `Removing bottle due to unknown entity: ${bottle.fullName}`,
          );
          await caller.bottleDelete(bottle.id);
        } else {
          // probably mismatched bottle
          if (bottle.brandId === entity.id) continue;

          if (!review.name.startsWith(entity.name)) {
            throw new Error();
          }

          let newName = review.name.slice(entity.name.length + 1);
          if (!newName) newName = formatCategoryName(bottle.category);

          console.log(
            `Updating ${bottle.fullName} to ${entity.name} ${newName} (from ${entity.name})`,
          );

          await caller.bottleUpdate({
            bottle: bottle.id,
            name: newName,
            brand: entity.id,
          });
        }
      }
    }
  });

subcommand.command("fix-stats").action(async () => {
  await db.update(bottles).set({
    avgRating: sql<number>`(
        SELECT AVG(rating)
        FROM ${tastings}
        WHERE ${tastings.bottleId} = ${bottles.id}
      )`,
    totalTastings: sql<number>`(
        SELECT COUNT(*)
        FROM ${tastings}
        WHERE ${tastings.bottleId} = ${bottles.id}
      )`,
  });
});
