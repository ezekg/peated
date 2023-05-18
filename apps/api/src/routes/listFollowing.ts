import { and, asc, desc, eq } from "drizzle-orm";
import type { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { db } from "../db";
import { follows } from "../db/schema";
import { buildPageLink } from "../lib/paging";
import { serialize } from "../lib/serializers";
import { FollowingSerializer } from "../lib/serializers/follow";
import { requireAuth } from "../middleware/auth";

export default {
  method: "GET",
  url: "/following",
  schema: {
    querystring: {
      type: "object",
      properties: {
        query: { type: "string" },
        page: { type: "number" },
        status: { type: "string", enum: ["pending", "following"] },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              $ref: "/schemas/follow",
            },
          },
          rel: {
            $ref: "/schemas/paging",
          },
        },
      },
    },
  },
  preHandler: [requireAuth],
  handler: async (req, res) => {
    const page = req.query.page || 1;
    const limit = 100;
    const offset = (page - 1) * limit;

    const where = [eq(follows.fromUserId, req.user.id)];
    if (req.query.status) {
      where.push(eq(follows.status, req.query.status));
    }

    const results = await db
      .select()
      .from(follows)
      .where(and(...where))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(follows.status), asc(follows.createdAt));

    res.send({
      results: await serialize(
        FollowingSerializer,
        results.slice(0, limit),
        req.user,
      ),
      rel: {
        nextPage: results.length > limit ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        next:
          results.length > limit
            ? buildPageLink(req.routeOptions.url, req.query, page + 1)
            : null,
        prev:
          page > 1
            ? buildPageLink(req.routeOptions.url, req.query, page - 1)
            : null,
      },
    });
  },
} as RouteOptions<
  Server,
  IncomingMessage,
  ServerResponse,
  {
    Params: {
      userId: number | "me";
    };
    Querystring: {
      page?: number;
      status?: "pending" | "following";
    };
  }
>;