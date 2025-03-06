// lib/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role =
        session.user.email === process.env.ADMIN_EMAIL ? "admin" : "viewer";
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // ✅ Enables detailed error logging
};

export default NextAuth(authOptions);
