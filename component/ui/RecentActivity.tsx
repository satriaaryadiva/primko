"use client";

import { useEffect, useState } from "react";
import { ArrowUpCircle, User } from "lucide-react";

interface Activity {
  id: string;
  type: "TOPUP" | "VIEW";
  corps?: string;
  totalUser: number;
  amount?: number;
  admin?: string;
  user?: string;
  createdAt: number;
}

export default function RecentActivity() {
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
 
  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/admin/activity?limit=5", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchActivity();
}, [ ]);

 
 

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-sm text-gray-400">Loading aktivitas...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-semibold mb-4">Aktivitas Terbaru</h2>

      <ul className="space-y-4 text-sm">
        {data.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 border-b pb-3 last:border-none"
          >
            {/* ICON */}
            <div
              className={`p-2 rounded-full 
              ${item.type === "TOPUP"
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"}`}
            >
              {item.type === "TOPUP" ? (
                <ArrowUpCircle size={16} />
              ) : (
                <User size={16} />
              )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 space-y-3">
             <p className="font-medium text-gray-800">
  {item.type === "TOPUP" ? (
    <>
      <span className="font-semibold">{item.admin}</span>{" "}
      top up{" "}
      <span className="text-blue-600 font-semibold">
        Rp {item.amount?.toLocaleString("id-ID")}
      </span>{" "}
      ke{" "}
      <span className="font-semibold">{item.corps}</span>{" "}
      <span className="text-gray-500">
        (total {item.totalUser} user)
      </span>
    </>
  ) : (
    <>
 
      <span className="font-semibold">{item.admin}</span>{" "}
      top up{" "}
      <span className="text-blue-600 font-semibold">
        Rp {item.amount?.toLocaleString("id-ID")}
      </span>{" "}
      ke{" "}
      <span className="font-semibold">{item.corps}</span>{" "}
      <span className="text-gray-500">
        (total {item.totalUser} user)
      </span>
  
    </>
  )}
</p>


              <p className="text-xs text-gray-400">
                 { new Date(item.createdAt).toLocaleString("id-ID")
}
                  
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
