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

    // Get history from subcollection
    const historySnap = await db
      .collection("users")
      .doc(decoded.uid)
      .collection("history")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const transactions = historySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount || 0,
        title: data.title || "Top Up",
        type: data.type || "topup",
        date: data.createdAt?.toDate?.() || data.date || new Date(),
        message: data.message,
        adminName: data.adminName,
      };
    });

    return NextResponse.json({
      transactions,
      total: transactions.length,
    });

  } catch (err: any) {
    console.error("History API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
