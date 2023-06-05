import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  getUsernamesForRoom: protectedProcedure
    .input(
      z.object({
        playerOneId: z.string().optional(),
        playerTwoId: z.string().optional().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { playerOneId, playerTwoId } = input;

      const playerOne = playerOneId
        ? await prisma.user.findUnique({
            where: {
              id: playerOneId,
            },
          })
        : undefined;

      const playerTwo = playerTwoId
        ? await prisma.user.findUnique({
            where: {
              id: playerTwoId,
            },
          })
        : undefined;

      return {
        playerOneUsername: playerOne?.userName,
        playerTwoUsername: playerTwo?.userName,
      };
    }),
});
