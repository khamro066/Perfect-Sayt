import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/api");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminApi && !req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isAdminPage && !isLoginPage && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
  if (isLoginPage && req.auth) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
