import { NextResponse, NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const candidateRoutes = ["/home", "/job-list", "/sessions"];
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
  const path = req.nextUrl.pathname;

  const isCandidateRoute = candidateRoutes.some((route) => path.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

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
  if ((isCandidateRoute || isAdminRoute) && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🚧 Jika sudah login & akses route public → redirect ke /home atau /admin/home
  if (isPublicRoute && accessToken && userRole) {
    const redirectUrl =
      userRole === "ADMIN" ? "/admin/home" : "/home";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // 🛡️ Cegah CANDIDATE masuk ke halaman ADMIN
  if (isAdminRoute && userRole === "CANDIDATE") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // 🛡️ Cegah ADMIN masuk ke halaman CANDIDATE
  if (isCandidateRoute && userRole === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
