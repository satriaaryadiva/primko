/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

export async function GET() {
  try {
    // 🔐 Authentication: Verify session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    // ✅ Verify Firebase token
    const decoded = await getAuth().verifyIdToken(sessionCookie.value);
    const db = getFirestore();

    // 🛡️ Authorization: Check if user is admin
    const userSnap = await db.collection("users").doc(decoded.uid).get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    const userRole = userData?.role?.trim(); // Clean whitespace

    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // 📊 Fetch summary data
    const summarySnap = await db
      .collection("admin_summary")
      .doc("main")
      .get();

    // Return default values if document doesn't exist
    if (!summarySnap.exists) {
      return NextResponse.json({
        totalUsers: 0,
        totalCorps: 0,
        totalCash: 0,
        todayTopup: 0,
      });
    }

    // Return actual data
    return NextResponse.json(summarySnap.data());

  } catch (err: any) {
    console.error("❌ ADMIN SUMMARY ERROR:", {
      message: err.message,
      code: err.code,
      stack: err.stack?.split('\n').slice(0, 3), // First 3 lines
    });

    // Handle specific errors
    if (err.code === "auth/id-token-expired") {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    if (err.code === "auth/argument-error") {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}