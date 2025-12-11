import { NextResponse } from "next/server";
 
import { getFirestore, Timestamp } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const { corps, amount, adminName } = await req.json();

    if (!corps || !amount)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const db = getFirestore();

    // ambil semua user 1 corps
    const snap = await db
      .collection("users")
      .where("corps", "==", corps)
      .where("isActive", "==", true)
      .get();

    if (snap.empty)
      return NextResponse.json(
        { error: "Tidak ada user di corps ini" },
        { status: 404 }
      );

    let batch = db.batch();
    let counter = 0;

    snap.forEach((doc) => {
      const userRef = doc.ref;
      const user = doc.data();
      const newCash = (user.cash || 0) + amount;

      // update total "cash" user
      batch.update(userRef, {
        cash: newCash,
        updatedAt: Timestamp.now(),
      });

      // push ke history masing-masing user
      const historyRef = userRef.collection("history").doc();
      batch.set(historyRef, {
        amount,
        type: "wajib",
        corps,
        admin: adminName,
        createdAt: Timestamp.now(),
      });

      counter++;

      // kalau batch udah mendekati limit → commit dan reset
      if (counter >= 400) {
        batch.commit();
        batch = db.batch();
        counter = 0;
      }
    });

    // commit batch terakhir
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Top up ${amount} ke semua user corps ${corps} selesai`,
      totalUpdated: snap.size,
    });
  } catch (err) {
    console.log("TOPUP CORPS ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
