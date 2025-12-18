"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StatsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6 mb-4" />
        </button>
        <h1 className="text-2xl font-bold">Statistik</h1>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 text-center">
          <p className="text-gray-500">Fitur statistik coming soon...</p>
        </div>
      </div>
    </div>
  );
}