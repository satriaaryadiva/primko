/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { ArrowUpCircle, User, Calendar } from "lucide-react";

interface Activity {
  id: string;
  type: "TOPUP_CORPS" | "VIEW";
  admin: string;
  corps?: string;
  amount?: number;
  totalUser?: number;
  createdAt: number;
}

export default function ActivityPage() {
  const [data, setData] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(
        `/api/admin/search/top-up-corps?${params.toString()}`
      );
      const json = await res.json();

      setData(json.activities || []);
    } catch (err) {
      console.error("Fetch activity failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, startDate, endDate]);

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-emerald-50 p-4 border-b">
        <h1 className="text-xl font-semibold">Activity Log</h1>

        {/* FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
          {/* START DATE */}
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm"
            />
          </div>

          {/* END DATE */}
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm"
            />
          </div>

          {/* RESET */}
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setPage(1);
            }}
            className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="bg-white rounded-3xl shadow divide-y">
          {loading ? (
            <p className="p-6 text-sm text-gray-400 text-center">
              Loading activity...
            </p>
          ) : data.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">
              Tidak ada activity
            </p>
          ) : (
            data.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-start gap-4 hover:bg-gray-50 transition"
              >
                {/* ICON */}
                <div
                  className={`w-11 h-11 flex items-center justify-center rounded-full ${
                    item.type === "TOPUP_CORPS"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.type === "TOPUP_CORPS" ? (
                    <ArrowUpCircle size={20} />
                  ) : (
                    <User size={20} />
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold">
                    {item.type === "TOPUP_CORPS"
                      ? "Top Up Saldo"
                      : "User Activity"}
                  </p>

                  <p className="text-sm text-gray-600">
                    <b>{item.admin}</b>
                    {item.type === "TOPUP_CORPS" && (
                      <>
                        {" "}
                        → <b>{item.corps}</b>
                      </>
                    )}
                  </p>

                  <p className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* META */}
                {item.type === "TOPUP_CORPS" && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">
                      +Rp {item.amount?.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.totalUser} user
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
