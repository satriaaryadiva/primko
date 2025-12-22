// File: component/admin/UserSearchFilters.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, X, ChevronDown } from "lucide-react";
import { Card } from "@/component/ui/Card";

interface UserSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCorps: string;
  onCorpsChange: (corps: string) => void;
  corpsList: string[];
  cacheLoaded: boolean;
  totalUsers: number;
  foundUsers: number;
}

// Predefined corps list - EXACT as requested
const PREDEFINED_CORPS = [
  "SET SINTEL",
  "SOPS",
  "SPERS",
  "SLOG",
  "SRENA",
  "SPOTMAR",
  "DISPOTMAR",
  "DISKUM",
  "DISMINPERS",
  "DISKES",
  "DISFASLAN",
  "DISHARKAN",
  "DISBEK",
  "DISANG",
  "DENMA",
  "KUWIL",
  "AKUN SATKOM",
  "DISSYAHAL",
  "RUMKIT",
  "FASHARKAN",
  "TIM INTEL",
  "DISPEN",
  "POMAL",
];

export function UserSearchFilters({
  searchQuery,
  onSearchChange,
  selectedCorps,
  onCorpsChange,
  
  cacheLoaded,
  totalUsers,
  foundUsers,
}: UserSearchFiltersProps) {
  const [showCorpsDropdown, setShowCorpsDropdown] = useState(false);
  const hasActiveFilters = searchQuery || selectedCorps;

  // Use PREDEFINED_CORPS, not database list
  const displayCorps = PREDEFINED_CORPS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Search Input */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={onSearchChange}
            disabled={!cacheLoaded}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition disabled:bg-gray-100"
          />
        </div>
      </Card>

      {/* Corps Filter Dropdown */}
      <Card>
        <div className="space-y-3">
          <div className="relative">
            <button
              onClick={() => setShowCorpsDropdown(!showCorpsDropdown)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">
                  {selectedCorps ? `Filter: ${selectedCorps}` : "Pilih Corps"}
                </span>
              </div>
              <motion.div
                animate={{ rotate: showCorpsDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </motion.div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showCorpsDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto"
                >
                  {/* All Option */}
                  <button
                    onClick={() => {
                      onCorpsChange("");
                      setShowCorpsDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left font-medium transition border-b ${
                      !selectedCorps
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Semua Corps
                  </button>

                  {/* Corps Options */}
                  {displayCorps.map((corps) => (
                    <button
                      key={corps}
                      onClick={() => {
                        onCorpsChange(corps);
                        setShowCorpsDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left font-medium transition border-b last:border-0 ${
                        selectedCorps === corps
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {corps}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
      >
        <div>
          <p className="text-sm text-blue-700 mb-1">Total User Ditemukan:</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-blue-600">{foundUsers}</p>
            <p className="text-sm text-blue-600">dari {totalUsers}</p>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              onSearchChange({
                target: { value: "" },
              } as React.ChangeEvent<HTMLInputElement>);
              onCorpsChange("");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}