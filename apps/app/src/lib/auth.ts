import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@genius/db";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database"
  },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })
  ],
  trustHost: true,
  secret: process.env.AUTH_SECRET
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
