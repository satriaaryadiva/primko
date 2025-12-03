/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createSession } from "@/actions/createSession";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);

const res = await signInWithEmailAndPassword(auth, email, password);

// GET TOKEN FRESH agar claim terbaru kebaca
const idToken = await res.user.getIdToken(true);

// Buat session cookie
await createSession(idToken);

// Ambil role dari token hasil decode
const decoded = JSON.parse(atob(idToken.split(".")[1]));
const role = decoded.role;

if (role === "admin") {
  router.push("/admin");
} else {
  router.push("/dashboard");
}
  }

  return (
    <div className="min-h-screen w-full bg-[#00D09E] flex    items-center flex-col pb-0 justify-center pt-6">
      <h1 className="text-center  text-xl my-18 font-extrabold    text-gray-900 tracking-loose">
       SELAMAT DATANG DI <br /> <span className="text-[#1E1E1E]">PRIMKO</span>
      </h1>

      <div className="bg-white md:max-w-md w-full mb-0 rounded-t-[70px] px-8 py-18 shadow-xl relative">
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Username Or Email
            </label>
            <input
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
              text-center
                mt-2 w-full px-4 py-3
                bg-gray-100 text-gray-700
                rounded-xl 
                outline-none border border-transparent
                focus:border-teal-500 focus:bg-white focus:shadow
                transition-all text-sm
              "
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-sm font-semibold text-gray-600">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
              text-center
                mt-2 w-full px-4 py-3 pr-10
                bg-gray-100 text-gray-700
                rounded-xl 
                outline-none border border-transparent
                focus:border-teal-500 focus:bg-white focus:shadow
                transition-all text-sm
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Button utama */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl 
              bg-teal-400 text-teal-900 text-2xl
              font-semibold shadow-md 
              active:scale-[0.98] transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? "Loading..." : "Log In"}
          </button>

          {/* Forgot */}
          <p className="text-xs text-center text-gray-500 cursor-pointer hover:text-teal-600 transition">
           <a
              className="
                  text-teal-500 
                text-sm font-semibold bg-white
              "
            >
             Lupa password?{"click disini"}  
            </a> 
            
          </p>

          {/* Sign Up */}
          <p className="text-xs text-center mt-6 text-gray-500">
           Belum punya akun ?
            <span className="text-teal-600 font-semibold cursor-pointer ml-1">
              
            Daftar
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

 