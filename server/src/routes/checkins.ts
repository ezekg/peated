import type { RouteOptions } from "fastify";
import { prisma } from "../lib/db";
import { IncomingMessage, Server, ServerResponse } from "http";
import { Checkin, Prisma } from "@prisma/client";
import { validateRequest } from "../middleware/auth";

export const listCheckins: RouteOptions<
  Server,
  IncomingMessage,
  ServerResponse,
  {
    Querystring: {
      page?: number;
    };
  }
> = {
  method: "GET",
  url: "/checkins",
  schema: {
    querystring: {
      type: "object",
      properties: {
        page: { type: "number" },
      },
    },
  },
  handler: async (req, res) => {
    const page = req.query.page || 1;

    const limit = 100;
    const offset = (page - 1) * limit;

    const results = await prisma.checkin.findMany({
      include: {
        bottle: true,
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    res.send(results);
  },
};

export const getCheckin: RouteOptions<
  Server,
  IncomingMessage,
  ServerResponse,
  {
    Params: {
      checkinId: number;
    };
  }
> = {
  method: "GET",
  url: "/checkins/:checkinId",
  schema: {
    params: {
      type: "object",
      required: ["checkinId"],
      properties: {
        checkinId: { type: "number" },
      },
    },
  },
  handler: async (req, res) => {
    const checkin = await prisma.checkin.findUnique({
      include: {
        bottle: true,
      },
      where: {
        id: req.params.checkinId,
      },
    });
    if (!checkin) {
      res.status(404).send({ error: "Not found" });
    } else {
      res.send(checkin);
    }
  },
};

export const addCheckin: RouteOptions<
  Server,
  IncomingMessage,
  ServerResponse,
  {
    Body: Checkin & {
      bottle: number;
    };
  }
> = {
  method: "POST",
  url: "/checkins",
  schema: {
    body: {
      type: "object",
      required: ["bottle", "rating"],
      properties: {
        bottle: { type: "number" },
        rating: { type: "number", minimum: 0, maximum: 5 },
        tastingNotes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  preHandler: [validateRequest],
  handler: async (req, res) => {
    const body = req.body;
    // gross syntax, whats better?
    const data: Prisma.CheckinUncheckedCreateInput = (({ bottle, ...d }: any) =>
      d)(body);

    if (body.bottle) {
      let bottle = await prisma.bottle.findUnique({
        where: { id: body.bottle },
      });

      if (!bottle) {
        res.status(400).send({ error: "Invalid bottle" });
        return;
      } else {
        data.bottleId = bottle.id;
      }
    }

    data.userId = req.user.id;

    const checkin = await prisma.checkin.create({
      data,
      include: {
        bottle: true,
      },
    });
    res.status(201).send(checkin);
  },
};