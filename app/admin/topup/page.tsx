// 2. SIMPLIFIED COMPONENT VERSION (if you want to keep the form component)
// ============================================
 
// TopupCorpsForm.tsx - Improved Version
"use client";

import { useState } from "react";

interface TopupFormProps {
  onSuccess?: () => void;
}

export default function TopupCorpsForm({ onSuccess }: TopupFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [corps, setCorps] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/top-up/topUp-corps", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corps,
          amount: Number(amount),
          title,
          message,
          date,
          adminName: "Admin Primko",
        }),
      });

      if (res.ok) {
        alert("Top up berhasil! 🚀");
        // Reset form
        setCorps("");
        setAmount("");
        setTitle("");
        setMessage("");
        onSuccess?.();
      } else {
        const data = await res.json();
        alert(data.error || "Top up gagal!");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Corps</label>
        <select
          value={corps}
          onChange={(e) => setCorps(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
          required
        >
          <option value="">Pilih Corps</option>
          <option value="angkatan laut">Angkatan Laut</option>
          <option value="angkatan darat">Angkatan Darat</option>
          <option value="angkatan udara">Angkatan Udara</option>
          <option value="SET">SET</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Amount</label>
        <input
          type="number"
          placeholder="50000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
        <input
          type="text"
          placeholder="Monthly Savings"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Message (Optional)</label>
        <textarea
          placeholder="Enter message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-400 text-white font-semibold py-3 rounded-lg hover:bg-emerald-500 transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Submit Top Up"}
      </button>
    </form>
  );
}
 