"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Building2, 
  Wallet, 
  
  CheckCircle2,
  XCircle
} from "lucide-react";

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

interface UserDetailModalProps {
  user: User | null;
   
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({
  user,
 
  isOpen,
  onClose,
}: UserDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 pb-9 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-4 bottom-30 max-h-[80vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Detail User</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* User Info Cards */}
            <div className="space-y-4 mb-6">
              {/* Name */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nama</p>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                </div>
              </div>

              {/* Corps */}
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-indigo-700">Corps</p>
                  <p className="font-bold text-indigo-900">{user.corps}</p>
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-700">Total Saldo</p>
                  <p className="font-bold text-2xl text-green-600">
                    {formatCurrency(user.cash)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <div className="bg-blue-100 p-3 rounded-lg">
                  {user.isActive ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-blue-700">Status</p>
                  <p
                    className={`font-bold ${
                      user.isActive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {user.isActive ? "Aktif" : "Tidak Aktif"}
                  </p>
                </div>
              </div>
            </div>

            {/* History Section */}
             
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}