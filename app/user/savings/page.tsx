"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Wallet, TrendingUp, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SavingsPage() {
  const router = useRouter();
  const [cash, setCash] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCash();
  }, []);

  const fetchCash = async () => {
    try {
      const res = await fetch("/api/profil", {
        credentials: "include",
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        setCash(data.cash || 0);
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
    <div className="min-h-screen bg-linear-to-br from-emerald-500 to-teal-600">
      {/* Header */}
      <div className="p-6 text-white">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6 mb-4" />
        </button>
        <h1 className="text-2xl font-bold">Tabungan Wajib</h1>
      </div>

      {/* Balance Card */}
      <div className="px-6 pb-6">
        <div className="bg-white/20 backdrop-blur rounded-3xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-6 h-6" />
            <span className="text-sm opacity-90">Total Saldo</span>
          </div>
          <h2 className="text-5xl font-bold mb-2">
            Rp {cash.toLocaleString("id-ID")}
          </h2>
          <p className="text-sm opacity-80">Tabungan Corps</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-t-[40px] px-6 pt-8 pb-6 space-y-4">
        <h3 className="font-semibold text-gray-900 mb-4">Statistik</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-2xl p-4">
            <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">Bulan Ini</p>
            <p className="text-xl font-bold text-gray-900">Rp 50.000</p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4">
            <Calendar className="w-8 h-8 text-emerald-600 mb-2" />
            <p className="text-sm text-gray-600">Total Bulan</p>
            <p className="text-xl font-bold text-gray-900">12 Bulan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
