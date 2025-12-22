/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(session);
    const db = getFirestore();

    // Check admin role
    const adminSnap = await db.collection("users").doc(decoded.uid).get();
    const adminData = adminSnap.data();
    
    if (adminData?.role?.trim() !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { userId, corps, amount, title, message } = body;

    // Validate
    if (!userId && !corps) {
      return NextResponse.json({ error: "userId or corps required" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    let affectedUsers: any[] = [];

    // Individual top up
    if (userId) {
      const userSnap = await db.collection("users").doc(userId).get();
      
      if (!userSnap.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userData = userSnap.data();

      // Check if user is active
      if (!userData?.isActive) {
        return NextResponse.json({ error: "User is not active" }, { status: 400 });
      }
      
      // Update user
      await userSnap.ref.update({
        cash: FieldValue.increment(amount),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Add to user's history
      await userSnap.ref.collection("history").add({
        amount,
        title: title || "Top Up",
        type: "topup",
        message,
        admin: adminData.name,
        createdAt: FieldValue.serverTimestamp(),
      });

      affectedUsers = [userData.name];

    } else {
      // Corps top up - ONLY ACTIVE USERS
      const usersSnap = await db
        .collection("users")
        .where("corps", "==", corps)
        .where("isActive", "==", true) // FILTER ACTIVE USERS ONLY
        .get();
      
      if (usersSnap.empty) {
        return NextResponse.json({ 
          error: "No active users found in corps" 
        }, { status: 404 });
      }

      // Update all active users in batch
      const batch = db.batch();
      
      usersSnap.docs.forEach(doc => {
        const userData = doc.data();
        affectedUsers.push(userData.name);

        batch.update(doc.ref, {
          cash: FieldValue.increment(amount),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Add to user's history
        const historyRef = doc.ref.collection("history").doc();
        batch.set(historyRef, {
          amount,
          title: title || "Top Up",
          type: "topup",
          message,
          admin: adminData.name,
          createdAt: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    }

    // Log activity with affected users
    await db.collection("Activities").add({
      type: "topup",
      amount,
      corps: corps || "individual",
      adminName: adminData.name,
      adminId: decoded.uid,
      affectedUsers,
      totalUsers: affectedUsers.length,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Top up successful",
      affectedUsers,
    });

  } catch (err: any) {
    console.error("Top up error:", err);
    return NextResponse.json({ 
      error: "Server error", 
      details: err.message 
    }, { status: 500 });
  }
}