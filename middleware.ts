import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "firebase-admin";

// Public routes (tidak butuh login)
const publicRoutes = ["/login", "/register", "/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ❗ Skip middleware untuk public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 🔐 Ambil cookie session
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // 🧪 Cek valid token (cek expired, tampered, dsb)
    await auth().verifyIdToken(token);

    // Jika token valid → lanjut
    return NextResponse.next();
  } catch (err) {
    console.error("❌ Invalid Session:", err);

    // 🧹 Hapus cookie rusak
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("session");

    return res;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/user/:path*",
  ],
};
