export default function AuthCard({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl shadow-xl bg-white">
      {children}
    </div>
  )
}
