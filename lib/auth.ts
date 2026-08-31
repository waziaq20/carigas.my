import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
})
