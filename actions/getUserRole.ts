"use server";

import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

export async function getUserRole() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return { role: null, error: "No session" };
    }

    const decoded = await getAuth().verifyIdToken(session);
    const db = getFirestore();
    
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    
    if (!userSnap.exists) {
      return { role: null, error: "User not found" };
    }

    const userData = userSnap.data();
    return { role: userData?.role?.trim() || "user", error: null };
    
  } catch (error) {
    console.error("getUserRole error:", error);
    return { role: null, error: "Failed to get role" };
  }
}