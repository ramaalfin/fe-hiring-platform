import { NextResponse, NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const candidateRoutes = ["/home", "/job-list"];
const adminRoutes = ["/admin/home", "/admin/job-list"];
const publicRoutes = [
  "/",
  "/signup",
  "/confirm-account",
  "/forgot-password",
  "/reset-password",
  "/check-email",
  "/magic-login/verify",
  "/magic-signup/verify",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isCandidateRoute = candidateRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const access_token = req.cookies.get("access_token")?.value || null;
  const refresh_token = req.cookies.get("refresh_token")?.value || null;

  let userRole: string | null = null;
  if (access_token) {
    try {
      const decoded: any = jwtDecode(access_token);
      userRole = decoded.role;
    } catch (error) {
      console.error("Failed to decode access token:", error);
    }
  }

  // 🚨 Jika belum login dan akses route private → redirect ke signin
  if ((isCandidateRoute || isAdminRoute) && !access_token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🚨 Jika sudah login dan akses route public → redirect otomatis
  if (isPublicRoute && access_token && userRole) {
    const redirectUrl = userRole === "ADMIN" ? "/admin/home" : "/home";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // 🚨 Cegah CANDIDATE akses halaman ADMIN
  if (isAdminRoute && userRole === "CANDIDATE") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // 🚨 Cegah ADMIN akses halaman CANDIDATE
  if (isCandidateRoute && userRole === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
