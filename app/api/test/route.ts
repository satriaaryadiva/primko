/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test 1: Env vars ada?
    const hasEnv = {
      projectId: !!process.env.FIREBASE_PROJECT_ID,
      clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    };

    console.log("ENV CHECK:", hasEnv);

    // Test 2: Firebase admin bisa di-import?
    const admin = await import("firebase-admin");
    console.log("ADMIN IMPORTED, apps:", admin.apps.length);

    // Test 3: Init firebaseAdmin
    await import("@/lib/firebaseAdmin");
    console.log("FIREBASE ADMIN INITIALIZED");

    // Test 4: Firestore bisa diakses?
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    console.log("FIRESTORE OK");

    return NextResponse.json({ 
      success: true, 
      hasEnv,
      appsCount: admin.apps.length 
    });

  } catch (err: any) {
    console.error("❌ TEST ERROR:", err.message, err.stack);
    return NextResponse.json({ 
      error: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
}