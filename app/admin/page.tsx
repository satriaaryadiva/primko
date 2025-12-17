"use client";

import { useEffect, useState } from "react";
import SummaryGrid from "@/component/summary/Sumarrygrid";
import DashboardSection from "@/component/ui/DashboardSection";
import TopupCorpsForm from "@/component/ui/topUpCorpsForm";
import RecentActivity from "@/component/ui/RecentActivity";
import Link from "next/link";
import LayoutWrapper from "@/component/motions/FormWrapper";

interface Summary {
  totalUsers: number;
  totalCorps: number;
  totalCash: number;
  todayTopup: number;
}

export default function AdminPage() {
  const [summary, setSummary] = useState<Summary>({
    totalUsers: 0,
    totalCorps: 0,
    totalCash: 0,
    todayTopup: 0,
  });

  useEffect(() => {
    fetch("/api/admin/summary")
      .then((res) => res.json())
      .then(setSummary)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#155dfc]  space-y-6">
      <h1 className="text-2xl text-white  p-16  font-bold">Admin Dashboard</h1>

      <SummaryGrid data={summary} />
     <LayoutWrapper className="bg-white flex-1 md:max-w-md w-full mt-6 rounded-t-[60px] px-8 py-14 shadow-xl" > 
      <DashboardSection title="Top Up Tabungan Wajib">
        <TopupCorpsForm />
      </DashboardSection>

      <Link href="/admin/activity">
        
          <RecentActivity />
         
      </Link> </LayoutWrapper>
    </div>
  );
}
