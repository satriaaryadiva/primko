// 2. ADMIN PAGE - /app/admin/page.tsx
// ============================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SummaryGrid from "@/component/summary/Sumarrygrid";
import DashboardSection from "@/component/ui/DashboardSection";
import TopupCorpsForm from "@/component/ui/topUpCorpsForm";
import RecentActivity from "@/component/ui/RecentActivity";
import Link from "next/link";
import LayoutWrapper from "@/component/motions/FormWrapper";
import { deleteSession } from "@/actions/createSession";

interface Summary {
  totalUsers: number;
  totalCorps: number;
  totalCash: number;
  todayTopup: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary>({
    totalUsers: 0,
    totalCorps: 0,
    totalCash: 0,
    todayTopup: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/summary", {
        method: "GET",
        credentials: "include", // Send cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned invalid response");
      }

      const data = await res.json();

      // Handle non-OK responses
      if (!res.ok) {
        // Unauthorized - redirect to login
        if (res.status === 401) {
          await deleteSession();
          router.push("/login");
          return;
        }

        // Forbidden - not admin
        if (res.status === 403) {
          router.push("/"); // Redirect to home or error page
          return;
        }

        throw new Error(data.error || `Error: ${res.status}`);
      }

      setSummary(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard";
      console.error("Fetch summary error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Retry handler
  const handleRetry = () => {
    fetchSummary();
  };

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#155dfc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#155dfc] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="w-full bg-[#155dfc] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Success state
  return (
    <div className="min-h-screen bg-[#155dfc] space-y-6">
      <div className="p-8 md:p-16">
        <h1 className="text-2xl md:text-3xl text-white font-bold">Admin Dashboard</h1>
      </div>

      <SummaryGrid data={summary} />

      <LayoutWrapper className="bg-white flex-1 md:max-w-md w-full mt-6 rounded-t-[60px] px-8 py-14 shadow-xl">
        <DashboardSection title="Top Up Tabungan Wajib">
          <TopupCorpsForm />
        </DashboardSection>

        <Link href="/admin/activity" className="block mt-6">
          <RecentActivity />
        </Link>
      </LayoutWrapper>
    </div>
  );
}