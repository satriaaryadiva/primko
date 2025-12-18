import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

export async function GET() {
  try {
    console.log("=== AUTH TEST START ===");

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log("All cookies:", allCookies.map(c => c.name));

    const sessionCookie = cookieStore.get("session");
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: "No session cookie",
        availableCookies: allCookies.map(c => c.name)
      }, { status: 401 });
    }

    console.log("Session cookie found, length:", sessionCookie.value.length);

    // Try verify
    const decoded = await getAuth().verifyIdToken(sessionCookie.value);
    console.log("Token verified! UID:", decoded.uid);

    // Try get user
    const db = getFirestore();
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    
    return NextResponse.json({
      success: true,
      uid: decoded.uid,
      userExists: userSnap.exists,
      userData: userSnap.exists ? userSnap.data() : null
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message,
      code: err.code,
      stack: err.stack?.split('\n').slice(0, 5) // First 5 lines only
    }, { status: 500 });
  }
}