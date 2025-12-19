/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Auth } from "./lib/firebaseAdmin";

const publicRoutes = ["/login", "/register", "/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("session")?.value;

  // 🚨 Jika token ADA → blokir akses public routes
  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/user", req.url));
  }
  // 🚨 Jika token TIDAK ADA → hanya boleh buka public routes
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔒 Token ada → verify token
  if (token) {
    try {
      const decoded = await Auth.verifyIdToken(token);
      const role = decoded.role;
      const url = req.nextUrl.clone();

      // Admin area
      if (pathname.startsWith("/admin") && role !== "admin") {
        url.pathname = "/user";
        return NextResponse.redirect(url);
      }

      // User area
      if (pathname.startsWith("/user") && role !== "user") {
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    } catch (e) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/admin/:path*", "/user/:path*", "/login", "/register"],
};

export const runtime = "nodejs";
