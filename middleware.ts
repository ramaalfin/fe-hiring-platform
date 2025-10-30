// middleware.ts
import { NextResponse } from "next/server";

export function middleware(req: any) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const url = req.nextUrl.clone();

  const protectedRoutes = ["/home", "/admin/home", "/job-list", "admin/job-list"];
  const isProtected = protectedRoutes.some((path) =>
    url.pathname.startsWith(path)
  );

  // Jika user belum login, redirect ke halaman login
  if (!accessToken && isProtected) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Jika user sudah login, hindari akses ke halaman signin/signup
  if (
    accessToken &&
    ["/", "/signin", "/signup", "/magic-login"].includes(url.pathname)
  ) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/magic-login",
    "/home/:path*",
    "/admin/home/:path*",
    "/job-list/:path*",
  ],
};
