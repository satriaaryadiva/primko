/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
 
import { getFirestore } from "firebase-admin/firestore";
 
import { Auth } from "@/lib/firebaseAdmin";
export async function GET() {
  try {
    const cookieStore = await cookies();
    // 🔐 Ambil session
    const cookie = cookieStore.get("session")?.value;

    if (!cookie)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await  Auth.verifySessionCookie(cookie, true);
    const uid = session.uid;

    // 🔥 Ambil user
    const db = getFirestore();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userSnap.data();

    // 🔥 Ambil transaksi terbaru
    const historySnap = await userRef
      .collection("expenses")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const history: any[] = [];
    let totalAmount = 0;

    historySnap.forEach((doc) => {
      const data = doc.data();
      history.push({ id: doc.id, ...data });
      totalAmount += data.amount || 0;
    });

    // 🔥 Summary
    const target = user?.target || 0;
    const percentage = target === 0 ? 0 : Math.floor((totalAmount / target) * 100);

    return NextResponse.json({
      user,
      summary: {
        total: totalAmount,
        target,
        percentage,
      },
      history,
    });
  } catch (err) {
    console.log("API ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
