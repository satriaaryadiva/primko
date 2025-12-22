/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { OptimizedUserSearch } from "./OptimizedSearchUser";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  FileText, 
  MessageSquare,
  Calendar,
  CheckCircle2,
  User,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/component/providers/ToastProviders";
import { Button } from "./Button";

interface TopUpFormProps {
  onSuccess?: () => void;
}

interface UserOption {
  uid: string;
  name: string;
  corps: string;
  email: string;
  cash: number;
}

// Predefined corps list - SAME as search page
const CORPS_LIST = [
  { value: "SET SINTEL", label: "SET SINTEL" },
  { value: "SOPS", label: "SOPS" },
  { value: "SPERS", label: "SPERS" },
  { value: "SLOG", label: "SLOG" },
  { value: "SRENA", label: "SRENA" },
  { value: "SPOTMAR", label: "SPOTMAR" },
  { value: "DISPOTMAR", label: "DISPOTMAR" },
  { value: "DISKUM", label: "DISKUM" },
  { value: "DISMINPERS", label: "DISMINPERS" },
  { value: "DISKES", label: "DISKES" },
  { value: "DISFASLAN", label: "DISFASLAN" },
  { value: "DISHARKAN", label: "DISHARKAN" },
  { value: "DISBEK", label: "DISBEK" },
  { value: "DISANG", label: "DISANG" },
  { value: "DENMA", label: "DENMA" },
  { value: "KUWIL", label: "KUWIL" },
  { value: "AKUN SATKOM", label: "AKUN SATKOM" },
  { value: "DISSYAHAL", label: "DISSYAHAL" },
  { value: "RUMKIT", label: "RUMKIT" },
  { value: "FASHARKAN", label: "FASHARKAN" },
  { value: "TIM INTEL", label: "TIM INTEL" },
  { value: "DISPEN", label: "DISPEN" },
  { value: "POMAL", label: "POMAL" },
];

export default function TopUpForm({ onSuccess }: TopUpFormProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showCorpsDropdown, setShowCorpsDropdown] = useState(false);
  
  // Form data
  const [topUpType, setTopUpType] = useState<"individual" | "corps">("corps");
  const [corps, setCorps] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const quickAmounts = [
    { label: "50K", value: 50000 },
    { label: "100K", value: 100000 },
    { label: "150K", value: 150000 },
    { label: "200K", value: 200000 },
  ];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const formatCurrency = (value: string) => {
    const number = parseInt(value.replace(/\D/g, ""));
    if (isNaN(number)) return "";
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setAmount(value);
  };

  const validateStep1 = () => {
    if (topUpType === "corps" && !corps) {
      toast.error("Pilih corps terlebih dahulu");
      return false;
    }
    if (topUpType === "individual" && !selectedUser) {
      toast.error("Pilih user terlebih dahulu");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!amount || parseInt(amount) <= 0) {
      toast.error("Masukkan jumlah top up");
      return false;
    }
    if (!title) {
      toast.error("Masukkan judul top up");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/topup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: topUpType === "individual" ? selectedUser?.uid : undefined,
          corps: topUpType === "corps" ? corps : undefined,
          amount: parseInt(amount),
          title,
          message,
          date,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Top up gagal");
      }

      toast.success("Top up berhasil! 🎉");
      
      // Reset form
      setCorps("");
      setSelectedUser(null);
      setAmount("");
      setTitle("");
      setMessage("");
      setStep(1);
      
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center">
            <motion.div
              animate={{
                scale: step === s ? 1.1 : 1,
                backgroundColor: step >= s ? "#2563eb" : "#e5e7eb",
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? "text-white" : "text-gray-400"
              }`}
            >
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </motion.div>
            {s < 2 && (
              <motion.div
                animate={{
                  backgroundColor: step > s ? "#2563eb" : "#e5e7eb",
                }}
                className="w-12 h-1 mx-1"
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Step 1: Select Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipe Top Up
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setTopUpType("corps");
                    setSelectedUser(null);
                  }}
                  className={`p-4 rounded-xl border-2 transition ${
                    topUpType === "corps"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Users className={`w-6 h-6 mx-auto mb-2 ${
                    topUpType === "corps" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <p className="text-sm font-medium">Corps</p>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setTopUpType("individual");
                    setCorps("");
                  }}
                  className={`p-4 rounded-xl border-2 transition ${
                    topUpType === "individual"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <User className={`w-6 h-6 mx-auto mb-2 ${
                    topUpType === "individual" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <p className="text-sm font-medium">Individual</p>
                </motion.button>
              </div>
            </div>

            {/* Corps Selection - Dropdown */}
            {topUpType === "corps" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <label className="block text-sm font-semibold text-gray-700">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Pilih Corps
                </label>
                
                <div className="relative">
                  <button
                    onClick={() => setShowCorpsDropdown(!showCorpsDropdown)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border-2 border-gray-200"
                  >
                    <span className="font-medium text-gray-900">
                      {corps || "Pilih Corps..."}
                    </span>
                    <motion.div
                      animate={{ rotate: showCorpsDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    </motion.div>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showCorpsDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto"
                      >
                        {CORPS_LIST.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => {
                              setCorps(c.value);
                              setShowCorpsDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left font-medium transition border-b last:border-0 ${
                              corps === c.value
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Individual User Search */}
            {topUpType === "individual" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Cari User (Hanya yang Aktif)
                </label>
                <OptimizedUserSearch
                  onSelect={setSelectedUser}
                  selectedUser={selectedUser}
                />
              </motion.div>
            )}

            <Button onClick={handleNext} fullWidth>
              Lanjut
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Quick Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Pilih Cepat
              </label>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((qa) => (
                  <motion.button
                    key={qa.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAmount(qa.value)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      parseInt(amount) === qa.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {qa.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Jumlah Top Up
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="text"
                  value={formatCurrency(amount)}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition text-lg font-semibold"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Judul Top Up
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Top Up Bulanan"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Catatan (Opsional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tambahkan catatan..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition resize-none"
              />
            </div>

            {/* Summary */}
            {amount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
              >
                <p className="text-sm text-blue-700 mb-2">Ringkasan:</p>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-blue-600">Target:</span>
                    <span className="font-semibold">
                      {topUpType === "corps" 
                        ? corps
                        : selectedUser?.name
                      }
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-blue-600">Total:</span>
                    <span className="font-bold text-lg">
                      Rp {formatCurrency(amount)}
                    </span>
                  </p>
                  {selectedUser && (
                    <p className="flex justify-between mt-2 pt-2 border-t">
                      <span className="text-green-600">Saldo Baru:</span>
                      <span className="font-bold text-green-700">
                        Rp {(selectedUser.cash + parseInt(amount)).toLocaleString("id-ID")}
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                variant="secondary"
                disabled={loading}
              >
                Kembali
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                fullWidth
              >
                Proses Top Up
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}