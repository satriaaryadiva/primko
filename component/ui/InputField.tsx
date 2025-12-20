"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import InputFade from "../motions/InputFade"

interface InputFieldProps {
  label: string
  type?: string
  placeholder?: string
  value: string
  disabled: boolean
  onChange: (v: string) => void
  icon?: React.ReactNode
}

export default function InputField({
  label,
  type = "text",
  disabled,
  placeholder,
  value,
  onChange,
  icon,
}: InputFieldProps) {

  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"

  return (
    <InputFade>
    <div className="w-full flex flex-col gap-1">
      <label className="text-md font-bold  text-[#363130] ">{label}</label>

      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">{icon}</span>}

        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full font-bold rounded-xl border m-0 border-gray-300 bg-[#DFF7E2] text-black py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${icon ? "pl-10" : ""}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black focus-within:-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div></InputFade>
  )
}

