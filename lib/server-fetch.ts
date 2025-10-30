// lib/server-fetch.ts
import { NextRequest, NextResponse } from "next/server";

export async function fetchWithAuth(req: NextRequest, targetUrl: string) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  let res = await fetch(`${baseUrl}${targetUrl}`, {
    headers: {
      Cookie: `accessToken=${accessToken}`,
    },
    credentials: "include",
  });

  // Jika token expired, refresh token
  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: "include",
    });

    if (!refreshRes.ok) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const newAccessToken = refreshRes.headers.get("Set-Cookie");

    // Retry request dengan access token baru
    res = await fetch(`${baseUrl}${targetUrl}`, {
      headers: {
        Cookie: newAccessToken || "",
      },
      credentials: "include",
    });

    // Buat response dan atur cookie baru
    const data = await res.json();
    const response = NextResponse.json(data);
    if (newAccessToken) {
      response.headers.set("Set-Cookie", newAccessToken);
    }

    return response;
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
