/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
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

    // Get URL params for pagination & filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const filter = searchParams.get("filter") || "all"; // all, this-month, last-month

    // Base query
    let query = db
      .collection("users")
      .doc(decoded.uid)
      .collection("history")
      .orderBy("createdAt", "desc");

    // Apply filter
    if (filter === "this-month") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      query = query.where("createdAt", ">=", startOfMonth);
    } else if (filter === "last-month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      query = query
        .where("createdAt", ">=", startOfLastMonth)
        .where("createdAt", "<=", endOfLastMonth);
    }

    // Apply limit
    query = query.limit(limit);

    const snapshot = await query.get();

    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount || 0,
        title: data.title || "Top Up",
        type: data.type || "topup",
        date: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        message: data.message,
        adminName: data.adminName,
      };
    });

    // Calculate summary
    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({
      transactions,
      summary: {
        total,
        count: transactions.length,
        filter,
      },
    });

  } catch (err: any) {
    console.error("Transaction API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
