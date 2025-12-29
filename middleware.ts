/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

const publicRoutes = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // ⚠️ CRITICAL: Skip middleware for API routes
  if (pathname.startsWith("/api")) {
    console.log("⚡ Skipping middleware for API:", pathname);
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  console.log("🔍 Middleware:", pathname, token ? "HAS TOKEN" : "NO TOKEN");

  // ROOT PATH
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded = await getAuth().verifyIdToken(token);
      const userRole = await getUserRole(decoded.uid);
      
      const redirectPath = userRole === "admin" ? "/admin" : "/user";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("session");
      return res;
    }
  }

  // PUBLIC ROUTES
  if (publicRoutes.includes(pathname)) {
    if (token) {
      try {
        const decoded = await getAuth().verifyIdToken(token);
        const userRole = await getUserRole(decoded.uid);
        
        const redirectPath = userRole === "admin" ? "/admin" : "/user";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      } catch (error) {
        const res = NextResponse.next();
        res.cookies.delete("session");
        return res;
      }
    }
    return NextResponse.next();
  }

  // PROTECTED ROUTES
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    const userRole = await getUserRole(decoded.uid);

    // Role-based access
    if (pathname.startsWith("/user") && userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (pathname.startsWith("/admin") && userRole === "user") {
      return NextResponse.redirect(new URL("/user", req.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error("❌ Auth error:", error);
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("session");
    return res;
  }
}

async function getUserRole(uid: string): Promise<string> {
  try {
    const db = getFirestore();
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return "user";
    }

    const userData = userDoc.data();
    return userData?.role?.trim() || "user";
  } catch (error) {
    console.error("❌ Error fetching role:", error);
    return "user";
  }
}

export const config = {
  matcher: [
    '/((?!manifest.json|service-worker.js|icon-512x512.png|icon-192x192.png|favicon.ico|_next/).*)'
  ]
}

 

export const runtime = "nodejs";