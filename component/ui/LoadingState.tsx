export function LoadingSpinner({ size = "md", color = "blue" }: { size?: "sm" | "md" | "lg"; color?: string }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={`animate-spin rounded-full border-b-4 border-${color}-600 ${sizes[size]}`} />
  );
}

export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-brrom-blue-50 to-indigo-100">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
}


// ============================================
// 3. ERROR STATES - Reusable
// /component/ui/ErrorState.tsx
// ============================================
