/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Filter, 
  ChevronDown,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle2,
  Building2
} from "lucide-react";
import { Card } from "@/component/ui/Card";
import { PageLoading } from "@/component/ui/LoadingState";
import { EmptyState } from "@/component/ui/ErrorState";

interface Activity {
  id: string;
  type: string;
  amount: number;
  corps: string;
  adminName: string;
  createdAt: string;
  affectedUsers?: Array<{ name: string; amount: number }>; // Changed: now includes amount per user
  totalUsers?: number;
}

const ITEMS_PER_PAGE = 5;

export default function AdminActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const filterOptions = [
    { value: "all", label: "Semua Aktivitas" },
    { value: "today", label: "Hari Ini" },
    { value: "week", label: "Minggu Ini" },
  ];

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/activity?filter=${filter}&limit=100`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentActivities = activities.slice(startIndex, endIndex);
  const totalAmount = activities.reduce((sum, act) => sum + act.amount, 0);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  const calculateTotalAmount = (activity: Activity) => {
    if (activity.affectedUsers && Array.isArray(activity.affectedUsers)) {
      // If affectedUsers is array of objects with amount
      if (activity.affectedUsers.length > 0 && typeof activity.affectedUsers[0] === 'object' && 'amount' in activity.affectedUsers[0]) {
        return activity.affectedUsers.reduce((sum, user) => sum + (user.amount || 0), 0);
      }
      // If affectedUsers is array of strings, multiply amount by count
      return activity.amount * activity.affectedUsers.length;
    }
    // If totalUsers exists, multiply amount by totalUsers
    return activity.amount * (activity.totalUsers || 1);
  };

  if (loading) return <PageLoading message="Loading activities..." />;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-8"
      >
        <button onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold mb-2">Aktivitas</h1>
        <p className="text-blue-100">Riwayat detail semua top up</p>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mt-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm">
                Total {filterOptions.find(f => f.value === filter)?.label}
              </p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Jumlah Aktivitas</p>
              <p className="text-2xl font-bold mt-1">{activities.length}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filter */}
      <div className="px-6 -mt-8 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

        {/* Pagination Info */}
        {activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-600 mt-3"
          >
            Menampilkan {startIndex + 1} - {Math.min(endIndex, activities.length)} dari{" "}
            {activities.length} aktivitas
          </motion.div>
        )}
      </div>

      {/* Activities List */}
      <div className="px-6 space-y-3">
        {currentActivities.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12 text-gray-400" />}
            title="Belum ada aktivitas"
            message="Belum ada top up yang dilakukan"
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {currentActivities.map((activity, index) => {
              const isExpanded = expandedCards.has(activity.id);
              
              return (
                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    {/* Card Header - Always Visible */}
                    <button
                      onClick={() => toggleCard(activity.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-green-100 p-3 rounded-xl">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 flex items-center gap-2">
                                {activity.type === "corps" ? (
                                  <>
                                    <Building2 className="w-4 h-4" />
                                    Top Up Corps
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-4 h-4" />
                                    Top Up Individual
                                  </>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">{activity.corps}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(activity.createdAt)} • {activity.adminName}
                          </p>
                          {activity.totalUsers && (
                            <p className="text-xs text-blue-600 mt-1">
                              {activity.totalUsers} user ter-top up
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-xl">
                            +{formatCurrency(calculateTotalAmount(activity))}
                          </p>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="mt-2"
                          >
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        </div>
                      </div>
                    </button>

                    {/* Expandable Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              User yang Ter-top up:
                            </h4>
                            
                            {activity.affectedUsers && activity.affectedUsers.length > 0 ? (
                              <div className="space-y-2">
                                {activity.affectedUsers.map((user, idx) => {
                                  const userName = typeof user === 'string' ? user : user.name;
                                  const userAmount = typeof user === 'object' && 'amount' in user ? user.amount : activity.amount;
                                  
                                  return (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                      <span className="text-sm text-gray-900">{userName}</span>
                                      <span className="text-xs text-green-600 ml-auto">
                                        +{formatCurrency(userAmount)}
                                      </span>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                Detail user tidak tersedia
                              </p>
                            )}

                            {/* Summary */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-700">Total User:</span>
                                <span className="font-semibold text-blue-900">
                                  {activity.totalUsers || activity.affectedUsers?.length || 0}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-blue-700">Total Amount:</span>
                                <span className="font-bold text-blue-900">
                                  {formatCurrency(calculateTotalAmount(activity))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-0 right-0 px-6"
        >
          <div className="bg-white rounded-2xl shadow-xl p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between gap-2">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page as number)}
                      className={`min-w-10 h-10 rounded-xl font-medium transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}