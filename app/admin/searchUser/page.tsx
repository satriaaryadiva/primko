"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
 
  Eye,
 
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import debounce from "lodash.debounce";
import { Card } from "@/component/ui/Card";
import { PageLoading } from "@/component/ui/LoadingState";
import { EmptyState } from "@/component/ui/ErrorState";
import { UserSearchFilters } from "@/component/ui/userSearchFilter";
import { UserDetailModal } from "@/component/ui/UserDetailModal";
interface User {
  uid: string;
  name: string;
  email: string;
  corps: string;
  cash: number;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserHistory {
  id: string;
  amount: number;
  title: string;
  date: string;
  adminName: string;
}

const ITEMS_PER_PAGE = 5;

export default function AdminSearchUserPage() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCorps, setSelectedCorps] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<UserHistory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [corpsList, setCorpsList] = useState<string[]>([]);

  // Load all users on mount
  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?limit=10000", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const users = data.users || [];
        setAllUsers(users);
        setFilteredUsers(users);
        
        // Extract unique corps
        const corps = [...new Set(users.map((u: User) => u.corps))].filter(Boolean).sort();
        setCorpsList(corps as string[]);
        
        setCacheLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Combined search and filter
  const applyFilters = useCallback((query: string, corps: string) => {
    if (!Array.isArray(allUsers) || allUsers.length === 0) {
      setFilteredUsers([]);
      setCurrentPage(1);
      return;
    }

    let results = allUsers;

    // Filter by search query
    if (query && query.length >= 1) {
      const lowerQuery = query.toLowerCase();
      results = results.filter((user) => {
        if (!user) return false;
        const matchName = user.name?.toLowerCase().includes(lowerQuery);
        const matchEmail = user.email?.toLowerCase().includes(lowerQuery);
        const matchCorps = user.corps?.toLowerCase().includes(lowerQuery);
        
        return matchName || matchEmail || matchCorps;
      });
    }

    // Filter by corps
    if (corps) {
      results = results.filter((user) => user.corps === corps);
    }

    // Sort by name
    results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    setFilteredUsers(results);
    setCurrentPage(1);
  }, [allUsers]);

  // Debounced filter
  const debouncedFilter = useMemo(
    () => debounce((query: string, corps: string) => {
      applyFilters(query, corps);
    }, 300),
    [applyFilters]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedFilter(query, selectedCorps);
  };

  const handleCorpsChange = (corps: string) => {
    setSelectedCorps(corps);
    debouncedFilter(searchQuery, corps);
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setShowModal(true);

    try {
      const res = await fetch(
        `/api/admin/searchUser?userId=${user.uid}`,
        { credentials: "include" }
      );

      if (res.ok) {
        const data = await res.json();
        setUserHistory(data.history || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

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

  if (loading) return <PageLoading message="Loading users..." />;

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
        <h1 className="text-3xl font-bold mb-2">Cari User</h1>
        <p className="text-blue-100">Lihat saldo dan history transaksi</p>
      </motion.div>

      {/* Filters */}
      <div className="px-6 -mt-8 mb-6">
        <UserSearchFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedCorps={selectedCorps}
          onCorpsChange={handleCorpsChange}
          corpsList={corpsList}
          cacheLoaded={cacheLoaded}
          totalUsers={allUsers.length}
          foundUsers={filteredUsers.length}
        />
      </div>

      {/* Results */}
      <div className="px-6 space-y-3">
        {!cacheLoaded ? (
          <PageLoading message="Loading users..." />
        ) : currentUsers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12 text-gray-400" />}
            title="Belum ada hasil"
            message={searchQuery || selectedCorps ? "Tidak ada user yang sesuai dengan kriteria pencarian" : "Tidak ada user"}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {currentUsers.map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{user.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.isActive ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {user.corps}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(user.cash)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewUser(user)}
                      className="bg-blue-100 p-3 rounded-xl hover:bg-blue-200 transition"
                    >
                      <Eye className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination Info */}
      {filteredUsers.length > 0 && (
        <div className="px-6 mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-600"
          >
            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} dari{" "}
            {filteredUsers.length} user
          </motion.div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-0 right-0 px-6"
        >
          <div className="bg-white rounded-2xl shadow-xl p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>

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

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        history={userHistory}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}