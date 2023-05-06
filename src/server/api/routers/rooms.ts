import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { RoomSchema } from "~/types/types";

export const roomsRouter = createTRPCRouter({
  createRoom: protectedProcedure
    .input(z.object({ wordToGuess: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { user } = session;
      const { wordToGuess } = input;

      const room = await prisma.room.create({
        data: {
          player1_ID: user.id,
          wordToGuess,
        },
      });

      return {
        roomId: room.id,
      };
    }),
  getAllRooms: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      const rooms = await prisma.room.findMany({
        include: {
          user: true,
        },
        orderBy: [{ createdAt: "desc" }],
      });

      const userId = session.user.id;

      return rooms.map((room) => ({
        username: room.user.userName,
        id: room.id,
        canJoin:
          !room.player2_ID ||
          room.player1_ID === userId ||
          room.player2_ID === userId,
        player1_ID: room.player1_ID,
        player2_ID: room.player2_ID,
      }));
    }
  ),
  updateRoom: protectedProcedure
    .input(RoomSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { id } = input;

      const updateData = input.updateData;

      const room = await prisma.room.update({
        where: {
          id,
        },
        data: {
          ...updateData,
        },
      });

      return room;
    }),
  getRoomData: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const room = await ctx.prisma.room.findUnique({
        where: {
          id: input.roomId,
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Room not found",
        });
      }

      return room;
    }),
});
