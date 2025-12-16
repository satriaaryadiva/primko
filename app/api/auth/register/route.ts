/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { NextResponse } from "next/server";
import { Auth } from "@/lib/firebaseAdmin"; // getAuth & firestore
import { Timestamp, getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, email, password ,corps, role, numberPhone } = await req.json();

    // 🔍 Validasi sederhana
    if (!name || !email || !password || !corps || !numberPhone) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // 🔐 Buat user dengan Firebase Admin Auth
    const newUser = await Auth.createUser({
      email,
      password,
      displayName: name,
    });

    // 🗂 Simpan data user ke Firestore
    await getFirestore().collection("users").doc(newUser.uid).set({
  uid: newUser.uid,
  name,
  email,
  corps,
  role,
  numberPhone,
  cash: 0,
  isActive: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});


    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          uid: newUser.uid,
          name,
          email,
          corps,
          numberPhone,
          cash: 0,
          createdAt: Timestamp.now(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register Error:", err);

    // 📌 Error email sudah dipakai
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "Email sudah digunakan." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
