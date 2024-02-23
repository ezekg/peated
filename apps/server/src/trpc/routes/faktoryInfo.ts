import { getClient } from "@peated/server/jobs";
import { adminProcedure } from "..";

export default adminProcedure.query(async function () {
  const client = await getClient();
  const info = await client.info();
  return info;
});
