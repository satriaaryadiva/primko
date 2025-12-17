/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { getAuth } from "firebase/auth";
import { auth } from "@/lib/firebase"; // CLIENT SDK
import { useRouter } from "next/navigation";

interface AdminProfile {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  corps?: string;
  isActive: boolean;
  createdAt: string | null;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;
  

        const token = await user?.getIdToken();

        const res = await fetch("/api/admin/profil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const json = await res.json();
        setProfile(json);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    await getAuth().signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-400">
        Loading profile...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 
                          flex items-center justify-center text-xl font-bold">
            {profile.name.charAt(0)}
          </div>

          <div>
            <h1 className="text-lg font-semibold">{profile.name}</h1>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        {/* INFO */}
        <div className="space-y-3 text-sm">
          <Info label="Role" value={profile.role} />
          <Info label="Corps" value={profile.corps ?? "-"} />
          <Info
            label="Status"
            value={profile.isActive ? "Active" : "Inactive"}
            badge
          />
          <Info
            label="Joined"
            value={
              profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("id-ID")
                : "-"
            }
          />
        </div>

        {/* ACTION */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 
                     py-2 rounded-xl border text-sm font-medium
                     hover:bg-gray-50 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      {badge ? (
        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
          {value}
        </span>
      ) : (
        <span className="font-medium">{value}</span>
      )}
    </div>
  );
}
