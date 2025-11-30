/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { Auth } from "@/lib/firebaseAdmin";
import { createSession } from "@/actions/createSession";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "idToken wajib dikirim dari FE." },
        { status: 400 }
      );
    }

    // ✔️ Verify idToken (pastikan berasal dari user asli)
    const decoded = await Auth.verifyIdToken(idToken);

    // ✔️ Buat session cookie
    await createSession(idToken);

    return NextResponse.json(
      {
        message: "Login berhasil! Session dibuat.",
        uid: decoded.uid,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Login Error:", err);
    return NextResponse.json(
      { error: "Kesalahan server." },
      { status: 500 }
    );
  }
}
