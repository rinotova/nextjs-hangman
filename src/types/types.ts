import { z } from "zod";
import type { inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type allRoomsOutput = RouterOutputs["rooms"]["getAllRooms"];
type roomDataOutput = RouterOutputs["rooms"]["getRoomData"];

export type Room = allRoomsOutput[number];
export type RoomData = roomDataOutput;

export const RoomSchema = z.object({
  id: z.string().optional(),
  updateData: z.object({
    player1_ID: z.string().optional(),
    player2_ID: z.string().optional(),
    isGuessed: z.boolean().optional(),
    lastLetter: z.string().optional(),
    attempts: z.number().optional(),
    lastAttemptTimestamp: z.date().optional(),
    wordToGuess: z.string().optional(),
  }),
});
