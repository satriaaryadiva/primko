import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";


export async function GET() {
  try {
    const db = getFirestore();
    const ref = db.collection("admin_summary").doc("main");
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Admin summary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: snap.data(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
