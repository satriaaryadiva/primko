/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useToast } from "@/component/providers/ToastProviders";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Briefcase, Phone } from "lucide-react";
import { deleteSession } from "@/actions/createSession";

interface Profile {
  uid: string;
  name: string;
  email: string;
  role: string;
  corps: string;
  numberPhone?: string;
  isActive: boolean;
  createdAt: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
   

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
       
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (profile?.isActive === false) {
        toast.error("Your account has been deactivated. hubungi admin");
      }
      setLoading(false);
    }

  };
   
  const handleLogout = async () => {
    await deleteSession();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-15 bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <button onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>
  
      {/* Profile Content */}
      <div className="px-6 py-8 space-y-4">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {profile?.name.charAt(0,).toUpperCase()}
          </div>
        </div>

        {/* Info Cards */}
        <div className="bg-white rounded-2xl p-4 space-y-4">
          <ProfileItem icon={<User />} label="Nama" value={profile?.name} />
          <ProfileItem icon={<Mail />} label="Email" value={profile?.email} />
          <ProfileItem icon={<Briefcase />} label="Corps" value={profile?.corps} />
          {profile?.numberPhone && (
            <ProfileItem icon={<Phone />} label="Phone" value={profile.numberPhone} />
          )}
        </div>

        {/* Status Badge */}
        <div className="bg-white rounded-2xl  p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Status</span>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
              profile?.isActive 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {profile?.isActive ? "Active" : "Inactive , Please Contact Admin"  }
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 pb-4 border-b last:border-0">
      <div className="text-blue-600">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
