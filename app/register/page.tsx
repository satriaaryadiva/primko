/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormWrapper from "@/component/motions/FormWrapper";
import InputField from "@/component/ui/InputField";
import AuthButton from "@/component/ui/AuthButton";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [corps, setCorps] = useState("");
  const [role, setRole] = useState("user");
  const [numberPhone, setNumberPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister(e: any) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          corps,
          role,
          numberPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registrasi gagal");
        setLoading(false);
        return;
      }

      alert("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch (err) {
      console.log(err);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-primary flex items-center flex-col justify-center pt-6">
      
      <FormWrapper delay={0.2}>
        <h1 className="text-center text-xl font-extrabold p-14 text-primary tracking-wide">
          BUAT AKUN <br />
          <span className="text-[#1E1E1E]">PRIMKO</span>
        </h1>
      </FormWrapper>

      <FormWrapper
        delay={0.45}
        className="bg-white flex-1 md:max-w-md w-full mt-6 rounded-t-[70px] px-8 py-14 shadow-xl"
      >
        <form onSubmit={handleRegister} className="space-y-6">

          <InputField
            label="Nama Lengkap"
            type="text"
            placeholder="Nama lengkap kamu"
            value={name}
            onChange={setName}
          />

          <InputField
            label="Email"
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

          <InputField
            label="Corps"
            type="text"
            placeholder="Masukkan nama corps"
            value={corps}
            onChange={setCorps}
          />

          <InputField
            label="No. HP"
            type="number"
            placeholder="08xxxxxxxxxx"
            value={numberPhone}
            onChange={setNumberPhone}
          />

          {/* Kalau pengen pilih role */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-primary">Role</label>
            <select
              className="border px-3 py-2 rounded-lg text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <AuthButton
            text={loading ? "Loading..." : "Daftar"}
            type="submit"
            variant="primary"
          />

          <p className="text-xs text-center mt-6 text-gray-500">
            Sudah punya akun?
            <span
              className="text-teal-600 font-semibold cursor-pointer ml-1"
              onClick={() => router.push("/login")}
            >
              Login
            </span>
          </p>
        </form>
      </FormWrapper>
    </div>
  );
}
