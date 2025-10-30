import { NextResponse, NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const candidateRoutes = ["/home", "/job-list"];
const adminRoutes = ["/admin/home", "/admin/job-list"];
const publicRoutes = [
  "/",
  "/signin",
  "/magic-login",
  "/magic-login/verify",
  "/signup",
  "/confirm-account",
  "/forgot-password",
  "/reset-password",
  "/check-email",
];

export default async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const url = req.nextUrl.clone();

  const publicRoutes = ["/", "/signin", "/signup", "/magic-login"];
  const candidateRoutes = ["/home", "/job-list"];
  const adminRoutes = ["/admin/home", "/admin/job-list"];

  const isPublic = publicRoutes.includes(url.pathname);
  const isCandidate = candidateRoutes.some((p) => url.pathname.startsWith(p));
  const isAdmin = adminRoutes.some((p) => url.pathname.startsWith(p));

  // decode access token to get user role
  let userRole: string | null = null;
  if (accessToken) {
    try {
      const decodedToken: any = jwtDecode(accessToken);
      userRole = decodedToken.role;
    } catch (error) {
      console.error("Failed to decode access token:", error);
    }
  }

  // 🚧 Jika belum login & akses route proteksi → redirect ke root
  if (!accessToken && (isCandidate || isAdmin)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ sudah login tapi di public route
  if (isPublic && accessToken && userRole) {
    const redirectUrl = userRole === "ADMIN" ? "/admin/home" : "/home";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
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
    "/admin/:path*",
    "/job-list/:path*",
  ],
};
