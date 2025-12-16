/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import {
  getFirestore,
  Timestamp,
  FieldValue,
} from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const { corps, amount, adminName } = await req.json();

    if (!corps || !amount || !adminName) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const db = getFirestore();

    const snap = await db
      .collection("users")
      .where("corps", "==", corps)
      .where("isActive", "==", true)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { error: "Tidak ada user aktif di corps ini" },
        { status: 404 }
      );
    }

    let batch = db.batch();
    let counter = 0;
    const batchCommits: Promise<any>[] = [];

    snap.forEach((doc) => {
      const userRef = doc.ref;
      const user = doc.data();

      batch.update(userRef, {
        cash: (user.cash || 0) + amount,
        updatedAt: Timestamp.now(),
      });

      batch.set(userRef.collection("history").doc(), {
        type: "TOPUP_CORPS",
        amount,
        corps,
        admin: adminName,
        createdAt: Timestamp.now(),
      });

      counter++;

      if (counter === 400) {
        batchCommits.push(batch.commit());
        batch = db.batch();
        counter = 0;
      }
    });

    if (counter > 0) batchCommits.push(batch.commit());
    await Promise.all(batchCommits);

    // 🔥 GLOBAL ACTIVITY
    await db.collection("Activities").add({
      type: "TOPUP_CORPS",
      corps,
      amount,
      admin: adminName,
      totalUser: snap.size,
      createdAt: Timestamp.now(),
    });

    // 📊 UPDATE ADMIN SUMMARY
    const totalCashAdded = amount * snap.size;

    await db.collection("admin_summary").doc("main").set(
      {
        totalCash: FieldValue.increment(totalCashAdded),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "Top up corps berhasil",
      totalUser: snap.size,
      totalCashAdded,
    });
  } catch (err) {
    console.error("TOPUP CORPS ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
