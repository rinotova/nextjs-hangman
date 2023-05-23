import { createTRPCRouter } from "~/server/api/trpc";
import { roomsRouter } from "~/server/api/routers/rooms";
import { usersRouter } from "./routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  rooms: roomsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
