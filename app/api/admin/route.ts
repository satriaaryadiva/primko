/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(session);
    const db = getFirestore();

    // Check admin role
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    const userRole = userSnap.data()?.role?.trim();

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get admin summary
    const summarySnap = await db.collection("admin_summary").doc("main").get();
    const summaryData = summarySnap.exists ? summarySnap.data() : {};

    // Get recent activities (last 5)
    const activitiesSnap = await db
      .collection("Activities")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const recentActivities = activitiesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.().toISOString(),
    }));

    return NextResponse.json({
      summary: {
        totalUsers: summaryData?.totalUsers || 0,
        totalCorps: summaryData?.totalCorps || 0,
        totalCash: summaryData?.totalCash || 0,
        todayTopup: summaryData?.todayTopup || 0,
      },
      recentActivities,
    });

  } catch (err: any) {
    console.error("Admin dashboard error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
