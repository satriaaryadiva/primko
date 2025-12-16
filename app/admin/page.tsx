"use client";

import RecentActivity from "@/component/ui/RecentActivity";
import StatCard from "@/component/ui/StatCard";
import TopupCorpsForm from "@/component/ui/topUpCorpsForm";
import Link from "next/link";
 
 

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>

      {/* STAT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total User" value="1.024" />
        <StatCard title="Total Corps" value="6" />
        <StatCard title="Total Cash" value="Rp 52.000.000" />
        <StatCard title="Top Up Hari Ini" value="Rp 1.500.000" />
      </div>

      {/* TOP UP */}
      <TopupCorpsForm/>

      {/* ACTIVITY */}
      <Link href="/admin/activity" className="text-primary font-semibold"> <RecentActivity /></Link>
     
    </div>
  );
}
