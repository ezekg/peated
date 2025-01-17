import type { Entity } from "@peated/server/types";
import EntityIcon from "@peated/web/assets/entity.svg";
import Link from "next/link";
import { getEntityTypeSearchUrl } from "../lib/urls";
import Chip from "./chip";
import PageHeader from "./pageHeader";

export default function EntityHeader({
  entity,
  to,
}: {
  entity: Entity;
  to?: string;
}) {
  return (
    <PageHeader
      icon={EntityIcon}
      title={entity.name}
      titleExtra={
        <div className="text-light max-w-full text-center lg:text-left">
          {!!entity.country && (
            <>
              Located in{" "}
              <Link
                href={`/locations/${entity.country.slug}`}
                className="truncate hover:underline"
              >
                {entity.country.name}
              </Link>
            </>
          )}
          {!!entity.country && !!entity.region && (
            <span> &middot; {entity.region}</span>
          )}
        </div>
      }
      metadata={
        <div className="flex gap-x-1">
          {entity.type.sort().map((t) => (
            <Chip
              key={t}
              size="small"
              color="highlight"
              as={Link}
              href={`${getEntityTypeSearchUrl(t)}?type=${encodeURIComponent(t)}`}
            >
              {t}
            </Chip>
          ))}
        </div>
      }
    />
  );
}
