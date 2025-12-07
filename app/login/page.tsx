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
 
 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);

    const res = await signInWithEmailAndPassword(auth, email, password);

    const idToken = await res.user.getIdToken(true);
    await createSession(idToken);

    const decoded = JSON.parse(atob(idToken.split(".")[1]));
    const role = decoded.role;

    if (role === "admin") router.push("/admin");
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen w-full  bg-primary flex items-center flex-col  justify-center pt-6">
      <FormWrapper delay={1.15}>
      <h1 className="text-center text-xl font-extrabold  p-14 text-primary tracking-wide">
        SELAMAT DATANG DI <br /> <span className="text-[#1E1E1E]">PRIMKO</span>
      </h1>
      </FormWrapper>

      <FormWrapper delay={0.55} className="bg-white m-0 relative   md:max-w-md w-full mt-6 rounded-t-[70px] px-8   py-14  shadow-xl">
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email */}
           
          <InputField
            label="Username Or Email"
            type="email"
            placeholder="example@example.com"
            value={email}
            onChange={setEmail}
          />

          {/* Password */}
          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
          />

          {/* Login Button */}
          <AuthButton
            text={loading ? "Loading..." : "Log In"}
            type="submit"
            variant="primary"
          />

          {/* Forgot */}
          <p className="text-xs text-center text-gray-500">
            <a className="text-teal-600 font-semibold cursor-pointer">
              Lupa password? <span>click disini</span>
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
      </FormWrapper>
    </div>
  );
}
