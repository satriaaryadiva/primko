/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useToast } from "@/component/providers/ToastProviders";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createSession } from "@/actions/createSession";
import { signInWithEmailAndPassword } from "firebase/auth";
import AuthButton from "@/component/ui/AuthButton";
import InputField from "@/component/ui/InputField";
import FormWrapper from "@/component/motions/FormWrapper";
import Link from "next/link";
import LampDemo from "@/component/ui/lamp";

export default function LoginPage() {

  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔐 Starting login...");

      // 1. Login dengan Firebase Auth
      const res = await signInWithEmailAndPassword(auth, email, password);
 

      // 2. Force refresh token
      const idToken = await res.user.getIdToken(true);
    

      // 3. Create session cookie
      const sessionResult = await createSession(idToken);
      console.log("✅ Session created:", sessionResult);

      // 4. Get role - SIMPLE APPROACH: Just decode token, let middleware handle the rest
      let userRole = "user"; // Default

      try {
        const decoded = JSON.parse(atob(idToken.split(".")[1]));
        userRole = decoded.role?.trim() || "user";
        console.log("✅ Role from token:", userRole);
      } catch (decodeError) {
        console.warn("⚠️ Could not decode token, using default role");
      }

      // 5. Show success toast
      if (userRole === "admin") {
        toast.success("Selamat datang kembali, Admin! 👋");
      } else {
        toast.success(`Selamat datang kembali! ${userRole} 👋`);
      }

      // 6. Simple redirect - Let middleware handle role verification
      console.log("🚀 Redirecting to:", userRole === "admin" ? "/admin" : "/user");
      
      // Use window.location for hard navigation (ensures middleware runs)
      window.location.href = userRole === "admin" ? "/admin" : "/user";

    } catch (err: any) {
      console.error("❌ Login error:", err);

      // Clear form
      setEmail("");
      setPassword("");

      // Handle specific errors
      let message = "Gagal login. Cek kembali datanya ya.";

      // Firebase Auth errors
      if (err.code === "auth/user-not-found") {
        message = "Email belum terdaftar. Coba periksa lagi ya!";
      } else if (err.code === "auth/wrong-password") {
        message = "Password kamu salah. Coba ketik ulang ya!";
      } else if (err.code === "auth/invalid-credential") {
        message = "Email atau password salah nih.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Terlalu banyak percobaan. Coba beberapa menit lagi ya.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Koneksi internet bermasalah. Coba lagi ya.";
      } else if (err.code === "auth/user-disabled") {
        message = "Akun kamu telah dinonaktifkan. Hubungi admin.";
      } else if (err.message?.includes("unexpected response")) {
        // Server error - bukan masalah user
        message = "Server sedang bermasalah. Coba lagi sebentar ya.";
        console.error("Server error details:", err);
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center flex-col">
      {/* HEADER */}
      <LampDemo>
        <FormWrapper delay={2.15} className="text-center text-white">
          <p>selamat datang di</p>
          <h1 className="font-extrabold text-5xl text-blue-500 tracking-wide">
            PRIMKO
          </h1>
          <p className="">management keuangan angkatan</p>
        </FormWrapper>
      </LampDemo>

      {/* FORM */}
      <FormWrapper
        delay={0.55}
        className="bg-white flex-1 fixed bottom-0 rounded-t-[70px] px-12 py-14 shadow-xl sm:max-w-sm w-full mx-auto"
      >
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 -mt-4">
              <p className="text-red-600 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}

          <InputField
            label="Username Or Email"
            type="email"
            placeholder="example@example.com"
            value={email}
            onChange={setEmail}
            disabled={loading}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            disabled={loading}
          />

          <AuthButton
            text={loading ? "Loading..." : "Log In"}
            type="submit"
            variant="primary"
          />

          <p className="text-sm text-center text-gray-500">
            Lupa password?
            <a
              href="/forgot-password"
              className="text-teal-600 font-semibold cursor-pointer ml-1"
            >
              Click disini
            </a>
          </p>

          <p className="text-sm text-center mt-6 text-gray-500">
            Belum punya akun?
            <Link
              href="/register"
              className="text-teal-600 font-semibold cursor-pointer ml-1"
            >
              Daftar
            </Link>
          </p>
        </form>
      </FormWrapper>
    </div>
  );
}

