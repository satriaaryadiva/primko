import { NextResponse } from "next/server";
import { Auth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, role } = await req.json();

    if (!uid || !role) {
      return NextResponse.json({ error: "UID dan role wajib" }, { status: 400 });
    }

    // Set custom claim
    await Auth.setCustomUserClaims(uid, { role });

    return NextResponse.json({ message: "Role berhasil diset" });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
