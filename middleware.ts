/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Auth } from "./lib/firebaseAdmin";

const publicRoutes = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await Auth.verifyIdToken(token);
    return NextResponse.next();
  } catch (e) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("session");
    return res;
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/",
    "/admin/:path*",
    "/user/:path*",
  ],
};

export const runtime = "nodejs";