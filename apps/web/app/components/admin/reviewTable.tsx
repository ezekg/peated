import { Link } from "@remix-run/react";

import type { Bottle, PagingRel, Review } from "@peated/server/types";
import Button from "../button";

export default ({
  reviewList,
  rel,
}: {
  reviewList: (Review & {
    bottle: Bottle;
  })[];
  rel?: PagingRel;
}) => {
  return (
    <>
      <table className="min-w-full">
        <colgroup>
          <col className="min-w-full sm:w-1/2" />
          <col className="sm:w-1/2" />
        </colgroup>
        <thead className="hidden border-b border-slate-800 text-sm font-semibold text-slate-500 sm:table-header-group">
          <tr>
            <th scope="col" className="px-3 py-2.5 text-left">
              Name
            </th>
            <th
              scope="col"
              className="hidden px-3 py-2.5 text-right sm:table-cell"
            >
              Rating
            </th>
          </tr>
        </thead>
        <tbody>
          {reviewList.map((review) => {
            return (
              <tr
                key={review.name}
                className="border-b border-slate-800 text-sm"
              >
                <td className="max-w-0 px-3 py-3">
                  <Link to={review.url} className="font-medium hover:underline">
                    {review.name}
                  </Link>
                  <div className="mt-2 space-x-2 text-xs">
                    {review.bottle ? (
                      <Link to={`/bottles/${review.bottle.id}`}>
                        Bottle {review.bottle.id}
                      </Link>
                    ) : (
                      <em>No Bottle</em>
                    )}
                  </div>
                </td>
                <td className="hidden px-3 py-3 text-right sm:table-cell">
                  {review.rating}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rel && (
        <nav
          className="flex items-center justify-between py-3"
          aria-label="Pagination"
        >
          <div className="flex flex-auto justify-between gap-x-2 sm:justify-end">
            <Button
              to={rel.prevCursor ? `?cursor=${rel.prevCursor}` : undefined}
              disabled={!rel.prevCursor}
            >
              Previous
            </Button>
            <Button
              to={rel.nextCursor ? `?cursor=${rel.nextCursor}` : undefined}
              disabled={!rel.nextCursor}
            >
              Next
            </Button>
          </div>
        </nav>
      )}
    </>
  );
};