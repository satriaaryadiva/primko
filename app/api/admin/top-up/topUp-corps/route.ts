/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const { corps, amount, adminName } = await req.json();

    if (!corps || !amount)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const db = getFirestore();

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
    const batchPromises: Promise<any>[] = [];

    snap.forEach((doc) => {
      const userRef = doc.ref;
      const user = doc.data();

      batch.update(userRef, {
        cash: (user.cash || 0) + amount,
        updatedAt: Timestamp.now(),
      });

      const historyRef = userRef.collection("history").doc();
      batch.set(historyRef, {
        amount,
        type: "wajib",
        corps,
        admin: adminName,
        createdAt: Timestamp.now(),
      });

      counter++;

      if (counter === 400) {
        batchPromises.push(batch.commit());
        batch = db.batch();
        counter = 0;
      }
    });

    if (counter > 0) {
      batchPromises.push(batch.commit());
    }

    await Promise.all(batchPromises);

    // 🔥 Activity Global
    await db.collection("Activities").add({
      type: "TOPUP_CORPS",
      corps,
      amount,
      admin: adminName,
      totalUser: snap.size,
      createdAt: Timestamp.now(),
    });

     const summaryRef = db.collection("admin_summary").doc("main");
    await summaryRef.set(
      {
        totalUsers: FieldValue.increment(1),
        
        totalCash: FieldValue.increment(amount),
        
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: `Top up ${amount} ke corps ${corps} berhasil`,
      totalUpdated: snap.size,
    });
  } catch (err) {
    console.log("TOPUP CORPS ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
