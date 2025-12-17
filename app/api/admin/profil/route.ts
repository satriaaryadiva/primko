/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import "@/lib/firebaseAdmin"; // 🔥 WAJIB: init admin sdk

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // 🔐 Ambil token
    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // ✅ Verify token
    const decoded = await getAuth().verifyIdToken(token);

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

    // 🛑 Guard admin
    if (!["admin", "super_admin"].includes(user?.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // ✅ RESPONSE CLEAN (no Timestamp leak)
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
    console.error("ADMIN PROFILE ERROR:", err);

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
