/* eslint-disable @typescript-eslint/no-explicit-any */
// 1. OPTIMIZED SEARCH - Client-side with Cache
// /component/ui/OptimizedUserSearch.tsx
// ============================================
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, X } from "lucide-react";
import  debounce  from "lodash.debounce";

interface UserOption {
  uid: string;
  name: string;
  email: string;
  corps: string;
  cash: number;
}

interface OptimizedUserSearchProps {
  onSelect: (user: UserOption) => void;
  selectedUser: UserOption | null;
}

export function OptimizedUserSearch({ onSelect, selectedUser }: OptimizedUserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load all active users ONCE on mount (cache in memory)
  useEffect(() => {
    loadAllActiveUsers();
  }, []);

  const loadAllActiveUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?onlyActive=true&limit=1000", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users);
        setCacheLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side fuzzy search (super fast, no API calls)
  const searchUsers = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setFilteredUsers([]);
      setShowDropdown(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Multi-field search: name, email, corps
    const results = allUsers.filter((user) => {
      const matchName = user.name.toLowerCase().includes(lowerQuery);
      const matchEmail = user.email.toLowerCase().includes(lowerQuery);
      const matchCorps = user.corps.toLowerCase().includes(lowerQuery);
      
      return matchName || matchEmail || matchCorps;
    });

    // Sort by relevance (exact match first, then starts with, then contains)
    const sorted = results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().startsWith(lowerQuery);
      const bNameMatch = b.name.toLowerCase().startsWith(lowerQuery);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return a.name.localeCompare(b.name);
    });

    setFilteredUsers(sorted.slice(0, 5)); // Max 5 results
    setShowDropdown(true);
  }, [allUsers]);

  // Debounce search (wait 300ms after user stops typing)
  const debouncedSearch = useMemo(
    () => debounce(searchUsers, 300),
    [searchUsers]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSelectUser = (user: UserOption) => {
    onSelect(user);
    setSearchQuery(user.name);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    onSelect(null as any);
    setSearchQuery("");
    setFilteredUsers([]);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => {
            if (filteredUsers.length > 0) setShowDropdown(true);
          }}
          placeholder={cacheLoaded ? "Cari nama, email, atau corps..." : "Loading users..."}
          disabled={!cacheLoaded}
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition disabled:bg-gray-100"
        />
        
        {/* Loading/Clear Button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : selectedUser ? (
            <button
              onClick={handleClearSelection}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Cache Status */}
      {!cacheLoaded && (
        <p className="text-xs text-gray-500 text-center">
          Loading {allUsers.length} active users...
        </p>
      )}

      {/* Results Dropdown */}
      <AnimatePresence>
        {showDropdown && filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg"
          >
            {filteredUsers.map((user) => (
              <button
                key={user.uid}
                onClick={() => handleSelectUser(user)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition border-b last:border-0 group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {user.corps}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">
                        Rp {user.cash.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            {/* Results Count */}
            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 text-center">
              {filteredUsers.length === 5 ? "Showing top 5 results" : `${filteredUsers.length} results found`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {cacheLoaded && searchQuery.length >= 2 && filteredUsers.length === 0 && !showDropdown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 text-sm text-gray-500"
        >
          Tidak ada user aktif yang cocok dengan {searchQuery}
        </motion.div>
      )}

      {/* Selected User Card */}
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">User Terpilih:</p>
              <p className="font-bold text-gray-900">{selectedUser.name}</p>
              <p className="text-xs text-gray-600">{selectedUser.email}</p>
              <p className="text-xs text-gray-600 mt-1">{selectedUser.corps}</p>
              <p className="text-sm text-blue-600 font-medium mt-2">
                Saldo: Rp {selectedUser.cash.toLocaleString("id-ID")}
              </p>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-blue-600 hover:text-blue-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}