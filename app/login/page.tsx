/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createSession } from "@/actions/createSession";
import { signInWithEmailAndPassword } from "firebase/auth";
import AuthButton from "@/component/ui/AuthButton";
import InputField from "@/component/ui/InputField";
import FormWrapper from "@/component/motions/FormWrapper";
import Link from "next/link";
import LampDemo from "@/component/ui/lamp";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(""); // <-- ERROR STATE

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setError(""); // clear error dulu

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await res.user.getIdToken(true);
      await createSession(idToken);

      const decoded = JSON.parse(atob(idToken.split(".")[1]));
      const role = decoded.role;

      if (role === "admin") router.push("/admin");
      else router.push("/user");

    } catch (err: any) {
      console.error(err);

      // 🔥 Firebase error handling yang ramah user
      let message = "Gagal login. Cek kembali datanya ya.";

      if (err.code === "auth/user-not-found") {
        message = "Email belum terdaftar. Coba periksa lagi ya!";
      }
      if (err.code === "auth/wrong-password") {
        message = "Password kamu salah. Coba ketik ulang ya!";
      }
      if (err.code === "auth/invalid-credential") {
        message = "Email atau password salah nih.";
      }
      if (err.code === "auth/too-many-requests") {
        message = "Terlalu banyak percobaan. Coba beberapa menit lagi ya.";
      }

      setError(message);

      // clear form
      setEmail("");
      setPassword("");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full flex items-center flex-col">
      {/* HEADER BIRU */}
      <LampDemo> 
      <FormWrapper delay={2.15} className="text-center text-white  ">
        <p>selamat datang di</p>
        <h1 className=" font-extrabold text-5xl  text-blue-500 tracking-wide">
          PRIMKO
        </h1>
        <p className="">management keuangan angkatan</p>
      </FormWrapper>
 </LampDemo>
      {/* FORM PUTIH */}
      <FormWrapper
        delay={0.55}
        className="bg-white flex-1 fixed bottom-0 rounded-t-[70px] px-12 py-14 shadow-xl sm:max-w-sm  w-full mx-auto"
      >
        <form onSubmit={handleLogin} className="space-y-6">

          {/* 🔥 Error Message */}
          {error && (
            <p className="text-red-600 text-sm text-center font-semibold -mt-4">
              {error}
            </p>
          )}

          <InputField
            label="Username Or Email"
            type="email"
            placeholder="example@example.com"
            value={email}
            onChange={setEmail}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
          />

          <AuthButton
            text={loading ? "" : "Log In"}
            type="submit"
            variant="primary"
          />

          <p className=" text-sm text-center text-gray-500"> Lupa password?
            <a href="/forgot-password" className="text-teal-600 font-semibold cursor-pointer">
              <span>click disini</span>
            </a>
          </p>

          <p className="text-sm text-center mt-6 text-gray-500">
            Belum punya akun ?
            <Link href="/register" className="text-teal-600 font-semibold cursor-pointer ml-1">
              Daftar
            </Link>
          </p>
        </form>
      </FormWrapper>
    </div>
  );
}
