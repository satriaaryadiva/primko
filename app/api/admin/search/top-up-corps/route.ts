import { NextResponse } from "next/server";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = 10;
    const type = searchParams.get("type"); // VIEW | TOPUP_CORPS
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const db = getFirestore();
    let query: FirebaseFirestore.Query = db
      .collection("Activities")
      .orderBy("createdAt", "desc");

    // ✅ FILTER TYPE (INI YANG TADI HILANG)
    if (type) {
      query = query.where("type", "==", type);
    }

    // ✅ FILTER DATE RANGE
    if (startDate) {
      query = query.where(
        "createdAt",
        ">=",
        Timestamp.fromDate(new Date(startDate + " 00:00:00"))
      );
    }

    if (endDate) {
      query = query.where(
        "createdAt",
        "<=",
        Timestamp.fromDate(new Date(endDate + " 23:59:59"))
      );
    }

    // ✅ PAGINATION (simple offset)
    query = query.offset((page - 1) * limit).limit(limit);

    const snap = await query.get();

    const activities = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toMillis(),
      };
    });

    return NextResponse.json({
      page,
      total: activities.length,
      activities,
    });
  } catch (err) {
    console.error("Activity API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
