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
    
    const userSnap = await db.collection("users").doc(decoded.uid).get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userSnap.data();

    return NextResponse.json({
      uid: decoded.uid,
      name: user?.name,
      email: user?.email,
      role: user?.role?.trim(),
      corps: user?.corps,
      numberPhone: user?.numberPhone || "",
      isActive: user?.isActive,
      cash: user?.cash || 0,
      createdAt: user?.createdAt?.toDate?.() ?? null,
      updatedAt: user?.updatedAt?.toDate?.() ?? null,
    });

  } catch (err: any) {
    console.error("Profile API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
