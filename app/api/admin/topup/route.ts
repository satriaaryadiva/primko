/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin";

export async function GET(request: Request) {
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
    if (adminSnap.data()?.role?.trim() !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const filter = searchParams.get("filter") || "all";

    // Build query
    let query = db.collection("Activities").orderBy("createdAt", "desc");

    // Apply filter
    if (filter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.where("createdAt", ">=", today);
    } else if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.where("createdAt", ">=", weekAgo);
    }

    query = query.limit(limit);

    const snapshot = await query.get();

    const activities = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        let affectedUsers: Array<{ name: string; amount: number }> = [];
        let totalUsers = 0;
        let activityType = "individual";

        // Determine activity type and get affected users
        if (data.corps && data.corps !== "individual") {
          // This is a corps top up
          activityType = "corps";
          
          try {
            const usersSnap = await db
              .collection("users")
              .where("corps", "==", data.corps)
              .get();
            
            affectedUsers = usersSnap.docs.map(userDoc => ({
              name: userDoc.data().name || "Unknown",
              amount: data.amount
            }));
            totalUsers = usersSnap.size;
          } catch (err) {
            console.error(`Error fetching corps users for ${data.corps}:`, err);
          }
        } 
        // Check if affectedUsers exists (individual top up)
        else if (data.affectedUsers) {
          activityType = "individual";
          
          // Convert object or array to array if needed
          let userIdentifiers: string[] = [];
          if (Array.isArray(data.affectedUsers)) {
            userIdentifiers = data.affectedUsers;
          } else if (typeof data.affectedUsers === 'object') {
            // Convert object with numeric keys to array
            userIdentifiers = Object.values(data.affectedUsers).filter(id => typeof id === 'string') as string[];
          }

          // Get user details - try both as ID and as username
          const userDetailsPromises = userIdentifiers.map(async (userIdentifier: string) => {
            try {
              // First, try to get by document ID
              const userDoc = await db.collection("users").doc(userIdentifier).get();
              
              if (userDoc.exists) {
                return {
                  name: userDoc.data()?.name || userIdentifier,
                  amount: data.amount
                };
              }
              
              // If not found by ID, try to find by username field
              const usersByName = await db
                .collection("users")
                .where("name", "==", userIdentifier)
                .limit(1)
                .get();
              
              if (!usersByName.empty) {
                return {
                  name: usersByName.docs[0].data()?.name || userIdentifier,
                  amount: data.amount
                };
              }
              
              // If still not found, just use the identifier as the name
              return {
                name: userIdentifier,
                amount: data.amount
              };
            } catch (err) {
              console.error(`Error fetching user ${userIdentifier}:`, err);
              return {
                name: userIdentifier,
                amount: data.amount
              };
            }
          });
          
          affectedUsers = await Promise.all(userDetailsPromises);
          totalUsers = affectedUsers.length;
        }

        return {
          id: doc.id,
          type: activityType,
          amount: data.amount,
          corps: data.corps || "Individual",
          adminName: data.adminName,
          createdAt: data.createdAt?.toDate?.().toISOString(),
          affectedUsers,
          totalUsers,
        };
      })
    );

    return NextResponse.json({
      activities,
      total: activities.length,
    });

  } catch (err: any) {
    console.error("Admin activities error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}