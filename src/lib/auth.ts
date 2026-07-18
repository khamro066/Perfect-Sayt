import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password;
        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (typeof password !== "string" || !hash) return null;
        const valid = await bcrypt.compare(password, hash);
        if (!valid) return null;
        return { id: "admin", name: "Admin" };
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
