/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/component/motions/FormWrapper";
import { Wallet, TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface UserData {
  name: string;
  corps: string;
  cash: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/dashboard", {
        credentials: "include",
        
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-500 to-blue-600">
      {/* Header */}
      <div className=" bg-blue-500 ">
<div className="p-6 text-white">
        <h2 className="text-sm opacity-90">Selamat Datang,</h2>
        <h1 className="text-2xl font-bold">{user?.name || "User"}</h1>
        <p className="text-sm opacity-80 mt-1">{user?.corps}</p>
      </div>

      {/* Cash Card */}
      <div className="px-6 pb-6">
        <div className="bg-white text-center   backdrop-blur rounded-3xl p-6  text-grey-200 ">
          <div className="flex items-center  gap-2 mb-2">
            <Wallet className="w-5 h-5" />
            <span className="text-sm opacity-90">Total Tabungan</span>
          </div>
          <h2 className="text-4xl font-bold">
            Rp {user?.cash?.toLocaleString("id-ID") || "0"}
          </h2>
        </div>
      </div>
      </div>
      

      {/* Menu Grid */}
      <LayoutWrapper className="bg-white flex-8 w-full h-full items-center  flex-col justify-between   rounded-t-[70px] px-10 py-8   gap-11 shadow-xl sm:max-w-full  mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Menu</h3>
 
        <Link  className="relative" href="/user/savings ">
          <div className="bg-blue-50  rounded-2xl p-4 flex items-center justify-between hover:bg-blue-100 transition">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Tabungan Saya</h4>
                <p className="text-sm text-gray-600">Lihat detail tabungan</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        <Link href="/user/history">
          <div className="bg-emerald-50 rounded-2xl p-4 flex items-center justify-between hover:bg-emerald-100 transition">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Riwayat</h4>
                <p className="text-sm text-gray-600">Transaksi & aktivitas</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      </LayoutWrapper>
    </div>
  );
}
