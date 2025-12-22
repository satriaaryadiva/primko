
import { useEffect, useState } from "react";

// Cache di localStorage
const CACHE_KEY = "admin_summary";
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

interface Summary {
  totalUsers: number;
  totalCorps: number;
  totalCash: number;
  todayTopup: number;
}

export function useSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        const cacheTime = localStorage.getItem(`${CACHE_KEY}_time`);

        if (cached && cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age < CACHE_DURATION) {
            setSummary(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }

        // Fetch from API
        const res = await fetch("/api/admin/summary", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setSummary(data);

        // Cache result
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return { summary, loading, error };
}