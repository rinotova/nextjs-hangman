import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import { env } from "~/env.mjs";
import { type GetServerSidePropsContext } from "next";

function makeid(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  userName?: string | null;
}

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      const theUser: ExtendedUser = user;
      if (session.user) {
        session.user.id = theUser.id;
        session.user.userName = theUser.userName as string;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     */
  ],
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        let userName = user.email?.split("@")[0];
        let userNameIsNotUnique;
        if (!userName) {
          userName = makeid(8);
        } else {
          userNameIsNotUnique = await prisma.user.findFirst({
            where: {
              userName,
            },
          });
        }

        if (userNameIsNotUnique) {
          const random4DigitsNumber = Math.floor(1000 + Math.random() * 9000);
          userName += random4DigitsNumber;
        }
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            userName,
          },
        });
      }
    },
  },
};

export default NextAuth(authOptions);

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
