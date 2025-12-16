/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import AuthButton from "@/component/ui/AuthButton";

export default function TopupCorpsForm() {
  const [corps, setCorps] = useState("");
  const [amount, setAmount] = useState(50000);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/admin//top-up/topUp-corps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        corps,
        amount,
        adminName: "Admin Primko",
      }),
    });

    setLoading(false);
    alert("Top up berhasil 🚀");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="font-semibold text-lg">Top Up Tabungan Wajib</h2>

      <select
        value={corps}
        onChange={(e) => setCorps(e.target.value)}
        className="w-full border rounded-lg p-2"
      >
        <option value="">Pilih Corps</option>
        <option value="SET">SET</option>
        <option value="marinir">Angkatan Darat</option>
        <option value="angkatan udara">Angkatan Udara</option>
      </select>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full border rounded-lg p-2"
      />

      <AuthButton
        type="submit"
        text={loading ? "" : "Submit Top Up"}
      />
    </form>
  );
}
