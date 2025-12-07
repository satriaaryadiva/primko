/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase"; 
import { sendPasswordResetEmail } from "firebase/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    await sendPasswordResetEmail(auth, email);

    return NextResponse.json({ message: "Link reset password sudah dikirim!" });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
