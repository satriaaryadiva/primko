/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

// IMPORTANT: Cache this endpoint
export const revalidate = 300; // 5 menit cache

export async function GET( ) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(session);
    const db = getFirestore();

    // Check admin - gunakan cached data jika possible
    const adminSnap = await db.collection("users").doc(decoded.uid).get();
    if (adminSnap.data()?.role?.trim() !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // OPTIMIZED: Use batch reads, avoid N+1 queries
    const [usersSnap, activitiesSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("Activities")
        .where("createdAt", ">=", new Date(Date.now() - 24 * 60 * 60 * 1000))
        .get()
    ]);

    const totalUsers = usersSnap.size;
    const totalCorps = new Set(
      usersSnap.docs.map(doc => doc.data().corps)
    ).size;

    const totalCash = usersSnap.docs.reduce(
      (sum, doc) => sum + (doc.data().cash || 0),
      0
    );

    const todayTopup = activitiesSnap.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    // Response dengan cache headers
    const response = NextResponse.json({
      totalUsers,
      totalCorps,
      totalCash,
      todayTopup,
    });

    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );

    return response;
  } catch (err: any) {
    console.error("Summary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
