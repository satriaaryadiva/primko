/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const corps = searchParams.get("corps") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = 10;

    const db = getFirestore();
    let query: FirebaseFirestore.Query = db.collection("users");

    if (corps) query = query.where("corps", "==", corps);

    query = query.orderBy("name").limit(limit).offset((page - 1) * limit);

    const snap = await query.get();

    let users = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (q) {
      users = users.filter((u: any) =>
        u.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    return NextResponse.json({ users });
  } catch (err) {
    console.error("SEARCH USER ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
