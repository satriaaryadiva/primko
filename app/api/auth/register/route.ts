/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("🔵 Register API called");

    const body = await req.json();
    console.log("📦 Request body:", { ...body, password: "***" });

    const { name, email, password, corps, role, numberPhone } = body;

    // Validation
    if (!name || !email || !password || !corps || !numberPhone) {
      console.log("❌ Validation failed: missing fields");
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Password validation (min 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed");

    // Create user in Firebase Auth
    console.log("🔐 Creating user in Firebase Auth...");
    const newUser = await getAuth().createUser({
      email,
      password,
      displayName: name,
    });
    console.log("✅ User created:", newUser.uid);

    // Save to Firestore
    console.log("💾 Saving to Firestore...");
    const db = getFirestore();
    
    await db.collection("users").doc(newUser.uid).set({
      uid: newUser.uid,
      name,
      email,
      corps,
      role: role || "user", // Default to user if not provided
      numberPhone,
      cash: 0,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log("✅ User saved to Firestore");

    // Update summary (with error handling)
    try {
      const summaryRef = db.collection("admin_summary").doc("main");
      const summaryDoc = await summaryRef.get();

      if (summaryDoc.exists) {
        await summaryRef.update({
          totalUsers: FieldValue.increment(1),
          updatedAt: Timestamp.now(),
        });
      } else {
        // Create if doesn't exist
        await summaryRef.set({
          totalUsers: 1,
          totalCorps: 0,
          totalCash: 0,
          todayTopup: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      console.log("✅ Summary updated");
    } catch (summaryError) {
      console.warn("⚠️ Summary update failed (non-critical):", summaryError);
      // Don't fail registration if summary update fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil! 🎉",
        user: {
          uid: newUser.uid,
          name,
          email,
          corps,
        },
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("❌ Register Error:", err);

    // Firebase Auth errors
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    }

    if (err.code === "auth/invalid-email") {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    if (err.code === "auth/weak-password") {
      return NextResponse.json(
        { error: "Password terlalu lemah" },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan server",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
      },
      { status: 500 }
    );
  }
}