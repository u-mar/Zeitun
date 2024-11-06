// lib/authOptions.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/prisma/client";
import { PrismaClient } from "@prisma/client";

export const AuthOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        if (!credentials) return null;

  
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && credentials.password) {
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user!;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours in seconds
  },
  adapter: PrismaAdapter(new PrismaClient()), // Use a default Prisma client for initialization
  pages: {
    signIn: "/auth/signIn",
  },
};

export default AuthOptions;
