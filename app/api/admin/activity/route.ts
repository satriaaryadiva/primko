 
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(req: Request) {
  try {
    const db = getFirestore();

    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit")) || 20;

    const snap = await db
      .collection("Activities")
      .orderBy("createdAt", "desc")
      .limit(limitParam)
      .get();

    const activities = snap.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        // 🔥 convert Timestamp → number (ms)
        createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      };
    });

    return NextResponse.json({
      total: activities.length,
      activities,
    });
  } catch (err) {
    console.error("ACTIVITY API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
