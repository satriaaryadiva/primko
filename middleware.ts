 
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import "@/lib/firebaseAdmin";

// Public routes yang bisa diakses tanpa login
const publicRoutes = ["/login", "/register", "/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  // ==========================================
  // 1. PUBLIC ROUTES - Redirect if logged in
  // ==========================================
  if (publicRoutes.includes(pathname)) {
    if (token) {
      try {
        const decoded = await getAuth().verifyIdToken(token);
        const userRole = decoded.role || (await getUserRole(decoded.uid));

        // Redirect based on role
        const redirectPath = userRole === "admin" ? "/admin" : "/user";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      } catch (error) {
        // Invalid token, delete and continue
        const res = NextResponse.next();
        res.cookies.delete("session");
        return res;
      }
    }
    // No token, allow access to public routes
    return NextResponse.next();
  }

  // ==========================================
  // 2. PROTECTED ROUTES - Require authentication
  // ==========================================
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ==========================================
  // 3. VERIFY TOKEN & CHECK ROLE
  // ==========================================
  try {
    const decoded = await getAuth().verifyIdToken(token);
    let userRole = decoded.role;

    // If role not in token, fetch from Firestore
    if (!userRole) {
      userRole = await getUserRole(decoded.uid);
    }

    // Clean role (remove whitespace/newlines)
    userRole = userRole?.trim();

    // ==========================================
    // 4. ROLE-BASED ACCESS CONTROL
    // ==========================================

    // Admin trying to access user routes
    if (pathname.startsWith("/user") && userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // User trying to access admin routes
    if (pathname.startsWith("/admin") && userRole === "user") {
      return NextResponse.redirect(new URL("/user", req.url));
    }

    // Admin must access /admin routes
    if (userRole === "admin" && !pathname.startsWith("/admin") && !publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // User must access /user routes
    if (userRole === "user" && !pathname.startsWith("/user") && !publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/user", req.url));
    }

    // Valid access - continue
    return NextResponse.next();

  } catch (error) {
    console.error("Middleware auth error:", error);
    
    // Invalid/expired token - clear and redirect to login
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
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return "user"; // Default to user if not found
    }

    const userData = userDoc.data();
    return userData?.role?.trim() || "user";
    
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "user"; // Default to user on error
  }
}

// ==========================================
// MATCHER CONFIG
// ==========================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export const runtime = "nodejs";
