/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, MessageSquare, Hash } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  title: string;
  type: string;
  date: string;
  message?: string;
  admin?: string;
}

interface TransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  if (!transaction) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-linear-to-br from-blue-600 to-blue-700 text-white p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-2">Detail Transaksi</h2>
              <p className="text-blue-100 text-sm">Informasi lengkap top up</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Amount */}
              <div className="bg-green-50 rounded-2xl p-4 text-center border-2 border-green-200">
                <p className="text-sm text-green-700 mb-1">Jumlah Top Up</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <DetailRow
                  icon={<Hash className="w-5 h-5" />}
                  label="ID Transaksi"
                  value={transaction.id.slice(0, 23)}
                />

                <DetailRow
                  icon={<Calendar className="w-5 h-5" />}
                  label="Tanggal & Waktu"
                  value={formatDate(transaction.date)}
                />

                <DetailRow
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="Keterangan"
                  value={transaction.title}
                />

               
                  <DetailRow
                    icon={<User className="w-5 h-5" />}
                    label="Diproses Oleh"
                    value={transaction.admin}
                  />
               

                {transaction.message && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Catatan</p>
                    <p className="text-gray-600 text-sm italic">
                      {transaction.message} by {transaction.admin}
                    </p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="text-gray-600 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}