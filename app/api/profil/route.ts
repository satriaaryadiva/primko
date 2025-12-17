// ========================================
// 1. API ROUTE (FIXED) - route.ts
// ========================================
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  try {
    // 🍪 Ambil session cookie (BUKAN header!)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    // ✅ Verify session cookie as ID token
    const decoded = await getAuth().verifyIdToken(sessionCookie.value);

    const db = getFirestore();
    const userRef = db.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userSnap.data();

    // ✅ RESPONSE CLEAN
    return NextResponse.json({
      uid: decoded.uid,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      corps: user?.corps,
      isActive: user?.isActive,
      createdAt: user?.createdAt?.toDate?.() ?? null,
      updatedAt: user?.updatedAt?.toDate?.() ?? null,
    });
  } catch (err: any) {
    console.error("PROFILE ERROR:", err);

    if (err.code === "auth/id-token-expired") {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}