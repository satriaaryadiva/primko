import { NextResponse } from "next/server";
import { Auth } from "@/lib/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUid = searchParams.get("uid");

    if (!targetUid) {
      return NextResponse.json(
        { error: "UID tidak ditemukan (query uid kosong)" },
        { status: 400 }
      );
    }

    // Ambil token Authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization token tidak ada" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = await Auth.verifyIdToken(token);

    const requesterUid = decoded.uid;
    const requesterRole = decoded.role || "user";

    // User biasa cuma boleh lihat history miliknya sendiri
    if (requesterRole === "user" && requesterUid !== targetUid) {
      return NextResponse.json(
        { error: "Tidak boleh akses history user lain" },
        { status: 403 }
      );
    }

    const db = getFirestore();

    // Ambil history
    const historySnap = await db
      .collection("users")
      .doc(targetUid)
      .collection("history")
      .orderBy("createdAt", "desc")
      .get();

    const history = historySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      uid: targetUid,
      total: history.length,
      history,
    });
  } catch (err: unknown) {
    console.log("ERROR SEARCH USER HISTORY:", err);
    const errorMessage = err instanceof Error ? err.message : "Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
