// ============================================
// BottomNavbar.tsx - Role-Based Reusable Component
// ============================================
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, BarChart3, ArrowLeftRight, Users, User, Settings, Wallet } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  path: string;
  label: string;
}

interface BottomNavbarProps {
  role: "admin" | "user";
}

// Admin navigation items
const adminNavItems: NavItem[] = [
  {
    icon: <Home className="w-6 h-6" />,
    path: "/admin",
    label: "Dashboard",
  },
  {
    icon: <Users className="w-6 h-6" />,
    path: "/admin/users",
    label: "Users",
  },
  {
    icon: <ArrowLeftRight className="w-6 h-6" />,
    path: "/admin/activity",
    label: "Activity",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    path: "/admin/reports",
    label: "Reports",
  },
  {
    icon: <Settings className="w-6 h-6" />,
    path: "/admin/settings",
    label: "Settings",
  },
];

// User navigation items
const userNavItems: NavItem[] = [
  {
    icon: <Home className="w-6 h-6" />,
    path: "/user",
    label: "Home",
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    path: "/user/savings",
    label: "Savings",
  },
  {
    icon: <ArrowLeftRight className="w-6 h-6" />,
    path: "/user/transactions",
    label: "Transactions",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    path: "/user/stats",
    label: "Statistics",
  },
  {
    icon: <User className="w-6 h-6" />,
    path: "/user/profile",
    label: "Profile",
  },
];

export default function BottomNavbar({ role }: BottomNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Select nav items based on role
  const navItems = role === "admin" ? adminNavItems : userNavItems;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                  relative flex flex-col items-center justify-center
                  w-16 h-16 rounded-2xl transition-all duration-300
                  ${active 
                    ? "bg-emerald-400 text-white scale-110" 
                    : "text-gray-600 hover:text-gray-900"
                  }
                `}
                aria-label={item.label}
              >
                <div className={`
                  transition-transform duration-300
                  ${active ? "scale-110" : "scale-100"}
                `}>
                  {item.icon}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

 