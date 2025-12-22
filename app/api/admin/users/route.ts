/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Query } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(session);
    const db = getFirestore();

    // Check admin role
    const adminSnap = await db.collection("users").doc(decoded.uid).get();
    if (adminSnap.data()?.role?.trim() !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get("onlyActive") === "true";
    const limit = parseInt(searchParams.get("limit") || "1000");

    // Build efficient query - start with collection reference
    let query: Query = db.collection("users");

    // Filter active users FIRST (most efficient)
    if (onlyActive) {
      query = query.where("isActive", "==", true);
    }

    // Apply limit last
    query = query.limit(limit);

    const snapshot = await query.get();

    // Return MINIMAL data (only what's needed for search)
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.name,
        email: data.email,
        corps: data.corps,
        cash: data.cash || 0,
      };
    });

    return NextResponse.json({
      users,
      total: users.length,
    });

  } catch (err: any) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}