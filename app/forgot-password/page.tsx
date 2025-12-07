/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthButton from "@/component/ui/AuthButton";
import InputField from "@/component/ui/InputField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);

      setMessage("Link reset password sudah dikirim ke email kamu 👌🔥");
      setEmail("");

    } catch (err: any) {
      console.log(err);

      let msg = "Gagal mengirim email reset.";

      if (err.code === "auth/user-not-found") msg = "Email tidak terdaftar.";
      if (err.code === "auth/invalid-email") msg = "Format email salah.";

      setError(msg);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-primary">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md">

        <h1 className="text-xl font-bold mb-4 text-center text-primary">
          Reset Password
        </h1>

        <p className="text-gray-600 text-sm mb-6 text-center">
          Masukkan email kamu. Kami bakal kirim link reset password ke sana.
        </p>

        {/* ERROR */}
        {error && (
          <p className="text-red-600 text-center mb-3 font-medium">{error}</p>
        )}

        {/* SUCCESS */}
        {message && (
          <p className="text-green-600 text-center mb-3 font-medium">
            {message}
          </p>
        )}

        <form onSubmit={handleReset} className="space-y-6">

          <InputField
            label="Email"
            placeholder="example@gmail.com"
            value={email}
            type="email"
            onChange={setEmail}
          />

          <AuthButton
            text={loading ? "" : "Kirim Link Reset"}
            type="submit"
            variant="primary"
          />
        </form>
      </div>
    </div>
  );
}
