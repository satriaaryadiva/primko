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

    // Build efficient query
    let query: Query = db.collection("users");

    // PENTING: Filter active users HANYA jika onlyActive=true
    // Jika onlyActive=false atau tidak ada parameter, ambil SEMUA user
    if (onlyActive) {
      query = query.where("isActive", "==", true);
    }
    // Jika onlyActive=false, tidak ada where clause, jadi ambil semua user (aktif + tidak aktif)

    // Apply limit
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
        isActive: data.isActive, // Include status
        cash: data.cash || 0,
        role: data.role,
        createdAt: data.createdAt,
      };
    });

    // Sort by active status (aktif dulu, baru tidak aktif)
    const sortedUsers = users.sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });

    return NextResponse.json({
      users: sortedUsers,
      total: sortedUsers.length,
    });

  } catch (err: any) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}