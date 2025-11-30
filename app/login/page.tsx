/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createSession } from "@/actions/createSession";
import { signInWithEmailAndPassword   } from "firebase/auth";
 
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
  const res = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await res.user.getIdToken();

      // 2️⃣ kirim token → buat session cookie
      await createSession(idToken);

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-teal-500 flex items-center justify-center px-4 py-6">
      
      <div className="bg-white w-full max-w-sm rounded-[35px] px-8 py-10 shadow-xl relative">
        
        {/* Logo + Title */}
        <h1 className="text-center text-2xl font-extrabold text-gray-900 mb-6 tracking-wide">
          Welcome To <span className="text-teal-600">Kas.Ku</span>
        </h1>

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
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                mt-2 w-full px-4 py-3
                bg-gray-100 text-gray-700
                rounded-xl 
                outline-none border border-transparent
                focus:border-teal-500 focus:bg-white focus:shadow
                transition-all text-sm
              "
            />
          </div>

          {/* Login admin */}
          <button
            type="button"
            className="
              w-full py-3 rounded-xl 
              bg-teal-600 text-white 
              text-sm font-semibold shadow-md 
              active:scale-[0.98] transition
            "
          >
            Log In As Admin
          </button>

          {/* Button utama */}
          <button
            type="submit"
            className="
              w-full py-3 rounded-xl 
              bg-teal-400 text-white 
              text-sm font-semibold shadow-md 
              active:scale-[0.98] transition
            "
          >
            {loading ? "Loading..." : "Log In"}
          </button>

          {/* Forgot */}
          <p className="text-xs text-center text-gray-500 cursor-pointer hover:text-teal-600 transition">
            Forgot Password?
          </p>

          {/* Sign Up */}
          <button
            type="button"
            className="
              w-full py-3 rounded-xl 
              border border-teal-400 text-teal-500 
              text-sm font-semibold bg-white
              active:scale-[0.98] transition
            "
          >
            Sign Up
          </button>

        </form>

        {/* Fingerprint */}
        <p className="text-xs text-center mt-6 text-gray-500">
          Use Fingerprint To Access
        </p>

        {/* Social icon */}
        <div className="flex justify-center space-x-6 mt-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
            🔵
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
            ⚪
          </div>
        </div>

        <p className="text-xs text-center mt-6 text-gray-500">
          Don’t have an account?
          <span className="text-teal-600 font-semibold cursor-pointer ml-1">
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}
