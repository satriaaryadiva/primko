import { Loader } from "lucide-react"

interface AuthButtonProps {
  text: string
  onClick?: () => void
  type?: "button" | "submit"
  variant?: "primary" | "outline"
}

export default function AuthButton({
  text,
  onClick,
  type = "button",
  variant = "primary",
}: AuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full py-3  rounded-xl font-semibold transition text-sm
        ${variant === "primary"
          ? "bg-blue-600 hover:bg-blue-800 text-white"
          : "border border-green-500 text-green-600 hover:bg-green-50"
         } 
      `}
    >
      {text || <Loader className="animate-spin m-auto" />}
    </button>
  )
}
