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

    // Get user data
    const userSnap = await db.collection("users").doc(decoded.uid).get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();

    // Get all history for statistics
    const historySnap = await db
      .collection("users")
      .doc(decoded.uid)
      .collection("history")
      .get();

    // Calculate monthly total (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let monthlyTotal = 0;
    historySnap.docs.forEach((doc) => {
      const data = doc.data();
      const txDate = data.createdAt?.toDate?.() || new Date();
      
      if (txDate >= thirtyDaysAgo) {
        monthlyTotal += data.amount || 0;
      }
    });

    // Calculate months of saving
    const createdAt = userData?.createdAt?.toDate?.() || new Date();
    const monthsSaving = Math.max(
      1,
      Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );

    return NextResponse.json({
      totalCash: userData?.cash || 0,
      monthlyTotal,
      monthsSaving,
      corps: userData?.corps,
      totalTransactions: historySnap.size,
      lastUpdate: userData?.updatedAt?.toDate?.() || null,
    });

  } catch (err: any) {
    console.error("Savings API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}