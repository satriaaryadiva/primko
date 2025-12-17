import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

export async function GET() {
  const db = getFirestore();

  const snap = await db
    .collection("admin_summary")
    .doc("main")
    .get();

  if (!snap.exists) {
    return NextResponse.json({
      totalUsers: 0,
      ActiveUSer: 0,
      totalCash: 0,
     
    });
  }

  return NextResponse.json(snap.data());
}
