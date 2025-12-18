"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  title: string;
  type: "topup";
}

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/user/history", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6 mb-4" />
        </button>
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
      </div>

      {/* Transactions List */}
      <div className="p-6 space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada transaksi</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <ArrowDownLeft className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{tx.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  +Rp {tx.amount.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
