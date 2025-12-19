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
    
    // Get user data
    const userSnap = await db.collection("users").doc(decoded.uid).get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userSnap.data();

    // Get recent 5 transactions
    const historySnap = await db
      .collection("users")
      .doc(decoded.uid)
      .collection("history")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const recentTransactions = historySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount || 0,
        title: data.title || "Top Up",
        date: data.createdAt?.toDate?.() || new Date(),
      };
    });

    return NextResponse.json({
      name: user?.name,
      corps: user?.corps,
      cash: user?.cash || 0,
      recentTransactions,
    });

  } catch (err: unknown) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}