/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/component/ui/ErrorState";
import { motion } from "framer-motion";
import { Users, Building2, Wallet, TrendingUp, ArrowRight, Activity } from "lucide-react";
import { Card, StatCard } from "@/component/ui/Card";
import { PageLoading } from "@/component/ui/LoadingState";
import TopupCorpsForm from "@/component/ui/topUpCorpsForm";
import RecentActivity from "@/component/ui/RecentActivity";
import Link from "next/link";
import { deleteSession } from "@/actions/createSession";

interface Summary {
  totalUsers: number;
  totalCorps: number;
  totalCash: number;
   
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: -60,
    
    transition: { duration: 0.5 },
  },
};

export default function AdminPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary>({
    totalUsers: 0,
    totalCorps: 0,
    totalCash: 0,
    
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/summary", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned invalid response");
      }

      if (!res.ok) {
        if (res.status === 401) {
          await deleteSession();
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          router.push("/");
          return;
        }
        const data = await res.json();
        throw new Error(data.error || `Error: ${res.status}`);
      }

      const data = await res.json();
      setSummary(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard";
      console.error("Fetch summary error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return <PageLoading message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSummary} />;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-10"
      >
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100">Kelola keuangan angkatan dengan mudah</p>
      </motion.div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1  md:grid-cols-2 gap-4 mb-8"
        >
          {/* Total Users */}
          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Users className="w-6 h-6 text-blue-600" />}
              label="Total Users"
              value={summary.totalUsers}
              trend="+12% this month"
            />
          </motion.div>

          {/* Total Corps */}
          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Building2 className="w-6 h-6 text-emerald-600" />}
              label="Total Corps"
              value={summary.totalCorps}
            />
          </motion.div>

          {/* Total Savings */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
            <StatCard
              icon={<Wallet className="w-6 h-6 text-purple-600" />}
              label="Total Tabungan"
              value={formatCurrency(summary.totalCash)}
            />
          </motion.div>

          {/* Today's Top Up */}
           
        </motion.div>

        {/* Action Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Top Up Form Card */}
          <motion.div variants={itemVariants}>
            <Link href="/admin/topup">
              <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Top Up Tabungan Wajib</h2>
                    <p className="text-gray-600 text-sm">Kelola top up untuk corps atau individual</p>
                  </div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  </motion.div>
                </div>
                <TopupCorpsForm />
              </Card>
            </Link>
          </motion.div>

          {/* Recent Activity Card */}
          <motion.div variants={itemVariants}>
            <Link href="/admin/activity">
              <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <Activity className="w-6 h-6" />
                      Aktivitas Terbaru
                    </h2>
                    <p className="text-gray-600 text-sm">Lihat riwayat semua transaksi top up</p>
                  </div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 text-indigo-600" />
                  </motion.div>
                </div>
                <RecentActivity />
              </Card>
            </Link>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-4"
          >
            <Link href="/admin/searchUser">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="bg-blue-100 p-4 rounded-lg mb-3 group-hover:bg-blue-200 transition-colors"
                  >
                    <Users className="w-6 h-6 text-blue-600" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900">Cari User</h3>
                  <p className="text-xs text-gray-600 mt-1">Lihat saldo & history</p>
                </div>
              </Card>
            </Link>

            <Link href="/admin/activity">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="bg-indigo-100 p-4 rounded-lg mb-3 group-hover:bg-indigo-200 transition-colors"
                  >
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900">Aktivitas</h3>
                  <p className="text-xs text-gray-600 mt-1">Riwayat transaksi</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}