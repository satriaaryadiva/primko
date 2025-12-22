"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp } from "lucide-react";
import TopUpForm from "@/component/ui/topUpCorpsForm";
import { Card } from "@/component/ui/Card";

export default function AdminTopUpPage() {
  const router = useRouter();
  const [topUpCount, setTopUpCount] = useState(0);

  const handleSuccess = () => {
    setTopUpCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-8"
      >
        <button onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold mb-2">Top Up Tabungan</h1>
        <p className="text-blue-100">Kelola top up anggota dengan mudah</p>
      </motion.div>

      {/* Stats */}
      <div className="px-6 -mt-8 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Up Hari Ini</p>
                <p className="text-3xl font-bold text-blue-600">{topUpCount}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Form */}
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <TopUpForm onSuccess={handleSuccess} />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}