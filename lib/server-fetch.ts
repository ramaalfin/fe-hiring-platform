// lib/server-fetch.ts
import { NextRequest, NextResponse } from "next/server";

export async function fetchWithAuth(req: NextRequest, targetUrl: string) {
  const access_token = req.cookies.get("access_token")?.value;
  const refresh_token = req.cookies.get("refresh_token")?.value;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  let res = await fetch(`${baseUrl}${targetUrl}`, {
    headers: {
      Cookie: `access_token=${access_token}`,
    },
    credentials: "include",
  });

  // Jika token expired, refresh token
  if (res.status === 401 && refresh_token) {
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refresh_token}`,
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
