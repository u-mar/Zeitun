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

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const currentTime = new Date();

        // Check if user is locked out
        if (user.lockoutUntil && currentTime < user.lockoutUntil) {
          throw new Error(
            `Account locked. Try again after ${user.lockoutUntil.toLocaleTimeString()}`
          );
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          // Increment failed attempts
          const failedAttempts = user.failedAttempts + 1;
          const lockoutUntil =
            failedAttempts >= 5
              ? new Date(currentTime.getTime() + 15 * 60 * 1000) // 15 minutes lockout
              : null;

          await prisma.user.update({
            where: { email: user.email! },
            data: {
              failedAttempts,
              lockoutUntil,
            },
          });

          if (lockoutUntil) {
            throw new Error(
              "Too many failed attempts. Try again in 15 minutes."
            );
          } else {
            throw new Error("Invalid email or password");
          }
        }

        // Reset failed attempts on successful login
        await prisma.user.update({
          where: { email: user.email! },
          data: {
            failedAttempts: 0,
            lockoutUntil: null,
          },
        });

        return user;
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
