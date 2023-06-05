import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { RoomSchema } from "~/types/types";

export const roomsRouter = createTRPCRouter({
  createRoom: protectedProcedure
    .input(z.object({ wordToGuess: z.string(), currentWordGuess: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { user } = session;
      const { wordToGuess, currentWordGuess } = input;

      const room = await prisma.room.create({
        data: {
          player1_ID: user.id,
          wordToGuess: wordToGuess.toUpperCase(),
          currentWordGuess,
        },
      });

      return {
        roomId: room.id,
      };
    }),
  getAllRooms: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      const rooms = await prisma.room.findMany({
        orderBy: [{ createdAt: "desc" }],
      });

      const getUserNameForRoom = async (userID: string) => {
        const user = await prisma.user.findUnique({
          where: {
            id: userID,
          },
        });
        if (!user) {
          return "";
        }
        return user.userName || "";
      };

      const userId = session.user.id;

      const mappedRooms = await Promise.all(
        rooms.map(async (room) => ({
          username: await getUserNameForRoom(room.player1_ID),
          id: room.id,
          canJoin:
            !room.player2_ID ||
            room.player1_ID === userId ||
            room.player2_ID === userId,
          player1_ID: room.player1_ID,
          player2_ID: room.player2_ID,
        }))
      );

      return mappedRooms;
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

      return room;
    }),
});
