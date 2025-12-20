/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  Calendar, 
  Filter,
  Search,
  ChevronDown
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  title: string;
  type: string;
  date: string;
  message?: string;
  adminName?: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [summary, setSummary] = useState({ total: 0, count: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  useEffect(() => {
    // Filter transactions by search query
    if (searchQuery) {
      const filtered = transactions.filter(
        (tx) =>
          tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.adminName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchQuery, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/transactions?filter=${filter}&limit=50`, {
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setFilteredTransactions(data.transactions);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { value: "all", label: "Semua Transaksi" },
    { value: "this-month", label: "Bulan Ini" },
    { value: "last-month", label: "Bulan Lalu" },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-linear-to-br from-blue-600 to-blue-700 text-white px-6 pt-6 pb-24">
        <button onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <h1 className="text-3xl font-bold mb-2">Transaksi</h1>
        <p className="text-blue-100">Riwayat top up tabungan</p>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mt-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm">Total {filterOptions.find(f => f.value === filter)?.label}</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(summary.total)}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Jumlah Transaksi</p>
              <p className="text-2xl font-bold mt-1">{summary.count}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="px-6 -mt-16 mb-6 space-y-3">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-2xl pl-12 pr-4 py-4 text-gray-900 shadow-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </motion.div>

        {/* Filter Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="w-full bg-white rounded-2xl px-4 py-4 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {filterOptions.find((f) => f.value === filter)?.label}
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform ${
                showFilterMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden z-10"
              >
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left transition ${
                      filter === option.value
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Transactions List */}
      <div className="px-6 space-y-3">
        {filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada transaksi"}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <ArrowDownLeft className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{tx.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(tx.date)}
                      </p>
                      {tx.adminName && (
                        <p className="text-xs text-gray-400 mt-1">
                          oleh {tx.adminName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">
                      +{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
                {tx.message && (
                  <p className="text-sm text-gray-600 mt-3 pl-14 italic">
                    {tx.message}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}