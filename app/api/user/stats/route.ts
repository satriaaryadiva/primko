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

    // Get all history
    const historySnap = await db
      .collection("users")
      .doc(decoded.uid)
      .collection("history")
      .orderBy("createdAt", "desc")
      .get();

    const transactions = historySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        amount: data.amount || 0,
        date: data.createdAt?.toDate?.() || new Date(),
        title: data.title || "Top Up",
      };
    });

    // Calculate totals
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

    // Monthly breakdown (last 6 months)
    const monthlyBreakdown = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthTx = transactions.filter((tx) => {
        return tx.date >= monthStart && tx.date <= monthEnd;
      });

      const monthTotal = monthTx.reduce((sum, tx) => sum + tx.amount, 0);

      monthlyBreakdown.push({
        month: date.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        amount: monthTotal,
        count: monthTx.length,
      });
    }

    // Largest transaction
    const largestTx = transactions.reduce(
      (max, tx) => (tx.amount > max.amount ? tx : max),
      { amount: 0, date: new Date(), title: "" }
    );

    return NextResponse.json({
      totalTransactions,
      totalAmount,
      averageAmount,
      monthlyBreakdown,
      largestTransaction: {
        amount: largestTx.amount,
        date: largestTx.date,
        title: largestTx.title,
      },
    });

  } catch (err: any) {
    console.error("Stats API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}