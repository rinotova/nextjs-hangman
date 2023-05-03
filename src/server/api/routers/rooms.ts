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
  getAllRooms: protectedProcedure.query(async ({ ctx: { prisma } }) => {
    const rooms = await prisma.room.findMany({
      include: {
        user: true,
      },
    });

    return rooms.map((room) => ({
      username: room.user.userName,
      id: room.id,
      isFull: !!room.player2_ID,
    }));
  }),
  updateRoom: protectedProcedure
    .input(RoomSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { id } = input;

      if (!id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Room not found",
        });
      }

      const roomUpdateData = { ...input };
      delete roomUpdateData.id;

      const room = await prisma.room.update({
        where: {
          id,
        },
        data: {
          ...roomUpdateData,
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

      return room;
    }),
});
