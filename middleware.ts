/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

// Public routes (tidak perlu login)
const publicRoutes = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  console.log("🔍 Middleware:", pathname, token ? "HAS TOKEN" : "NO TOKEN");

  // ==========================================
  // 1. ROOT PATH "/" - Redirect based on auth
  // ==========================================
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded = await getAuth().verifyIdToken(token);
      const userRole = await getUserRole(decoded.uid);
      
      console.log("✅ Root redirect - Role:", userRole);
      
      const redirectPath = userRole === "admin" ? "/admin" : "/user";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("session");
      return res;
    }
  }

  // ==========================================
  // 2. PUBLIC ROUTES - Redirect if logged in
  // ==========================================
  if (publicRoutes.includes(pathname)) {
    if (token) {
      try {
        const decoded = await getAuth().verifyIdToken(token);
        const userRole = await getUserRole(decoded.uid);
        
        console.log("✅ Public route redirect - Role:", userRole);
        
        const redirectPath = userRole === "admin" ? "/admin" : "/user";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      } catch (error) {
        console.error("❌ Token invalid on public route");
        const res = NextResponse.next();
        res.cookies.delete("session");
        return res;
      }
    }
    // No token - allow access to login/register
    return NextResponse.next();
  }

  // ==========================================
  // 3. PROTECTED ROUTES - Require token
  // ==========================================
  if (!token) {
    console.log("❌ No token, redirect to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ==========================================
  // 4. VERIFY TOKEN & ROLE-BASED ACCESS
  // ==========================================
  try {
    const decoded = await getAuth().verifyIdToken(token);
    const userRole = await getUserRole(decoded.uid);
    
    console.log("✅ Token verified - UID:", decoded.uid, "Role:", userRole);

    // Admin trying to access user routes
    if (pathname.startsWith("/user") && userRole === "admin") {
      console.log("⚠️ Admin trying /user, redirect to /admin");
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // User trying to access admin routes
    if (pathname.startsWith("/admin") && userRole === "user") {
      console.log("⚠️ User trying /admin, redirect to /user");
      return NextResponse.redirect(new URL("/user", req.url));
    }

    // Valid access
    console.log("✅ Access granted");
    return NextResponse.next();

  } catch (error) {
    console.error("❌ Auth error:", error);
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("session");
    return res;
  }
}

// ==========================================
// HELPER: Get user role from Firestore
// ==========================================
async function getUserRole(uid: string): Promise<string> {
  try {
    const db = getFirestore();
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      console.log("⚠️ User doc not found, defaulting to 'user'");
      return "user";
    }

    const userData = userDoc.data();
    const role = userData?.role?.trim() || "user";
    
    console.log("📋 Fetched role from Firestore:", role);
    
    return role;
  } catch (error) {
    console.error("❌ Error fetching role:", error);
    return "user";
  }
}

// ==========================================
// CONFIG
// ==========================================
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export const runtime = "nodejs";


// ==========================================
// DEBUG CHECKLIST
// ==========================================
/*
1. Cek Firestore user document:
   - users/{uid}/role harus ada
   - Value harus "user" atau "admin" (lowercase)
   - Tidak ada whitespace atau newline

2. Cek session cookie:
   - Browser DevTools → Application → Cookies
   - Cookie name: "session"
   - Value harus ada dan tidak expired

3. Test flow:
   - Login sebagai user
   - Cek console logs di browser
   - Seharusnya redirect ke /user
   - Akses /user/* harus bisa
   - Akses /admin harus redirect ke /user

4. Common issues:
   - Role di Firestore ada newline: "user\n" ❌
   - Role uppercase: "User" ❌ (harus "user")
   - Token expired: re-login
   - Cookie tidak terkirim: cek sameSite settings
*/