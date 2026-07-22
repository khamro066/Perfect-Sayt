import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  // Without this, Auth.js rejects the request's Host header as untrusted
  // in production (logged as "[auth][error] UntrustedHost") and the
  // auth() check in proxy.ts fails open instead of closed — every /admin
  // page and /api/admin/* route was served with NO auth check at all.
  // Verified locally via `next start`: before this flag, GET /api/admin/products
  // returned the full product list with zero cookies; after, it 401s.
  // This app has no OAuth callback/email-link flows that host-spoofing
  // could exploit, so trusting the host here is safe.
  trustHost: true,
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
