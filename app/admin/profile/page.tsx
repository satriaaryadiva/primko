/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/actions/createSession";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  corps: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  permissions?: string[]; // optional untuk admin
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // 📡 Hit API universal (semua role pakai endpoint yang sama)
      const res = await fetch("/api/profil", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        
        if (res.status === 401) {
          await deleteSession();
          router.push("/login");
          return;
        }

        throw new Error(data.error || "Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data);

    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchProfile();
  };

  const handleLogout = async () => {
    try {
      await deleteSession();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // 🌀 Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ Success
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            {profile && (
              <p className="text-sm text-gray-500 mt-1">
                Role: <span className="font-semibold">{profile.role}</span>
              </p>
            )}
          </div>
          <div className="space-x-2">
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        {profile && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <ProfileField label="Name" value={profile.name} />
              <ProfileField label="Email" value={profile.email} />
              <ProfileField label="Role" value={profile.role} />
              <ProfileField label="Corps" value={profile.corps} />
              <ProfileField 
                label="Status" 
                value={profile.isActive ? "Active" : "Inactive"}
                valueClass={profile.isActive ? "text-green-600" : "text-red-600"}
              />
              <ProfileField 
                label="Created" 
                value={profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "-"} 
              />
              <ProfileField 
                label="Updated" 
                value={profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "-"} 
              />
            </div>

            {/* Admin-only section */}
            {profile.role === "admin" && profile.permissions && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Admin Permissions</h3>
                <div className="flex gap-2 flex-wrap">
                  {profile.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 📝 Reusable field
function ProfileField({ 
  label, 
  value, 
  valueClass = "text-gray-900" 
}: { 
  label: string; 
  value: string; 
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center border-b pb-3">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}