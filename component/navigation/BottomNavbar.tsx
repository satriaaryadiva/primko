// ============================================
// BottomNavbar.tsx - Role-Based Reusable Component
// ============================================
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, BarChart3, ArrowLeftRight, Users, User, Wallet, PlusCircleIcon } from "lucide-react";

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
    icon: <PlusCircleIcon className="w-6 h-6" />,
    path: "/admin/activity",
    label: "Activity",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    path: "/admin/reports",
    label: "Reports",
  },
   {
    icon: <Users className="w-6 h-6" />,
    path: "/admin/profile",
    label: "Profile",
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
    path: "/user/statistik",
    label: "Statistics",
  },
  {
    icon: <User className="w-5 h-5" />,
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
    <nav className="fixed bottom-0 left-0 right-0  rounded-t-3xl bg-blue-100  w-full items-center m-auto sm:space-x-2.5  text-white border-t border-gray-200 safe-bottom z-50">
      <div className="max-w-md mx-auto  px-4">
        <div className="flex items-center   gap-5 justify-around py-3">
          {navItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                  relative flex flex-col items-center justify-center
                  w-13 h-13 rounded-2xl font-bold  transition-all duration-300
                  ${active 
                    ? "bg-blue-600 font-bold w-10 h-10 text-white scale-110" 
                    : "text-black  w-8 h-8   hover:text-gray-900"
                  }
                `}
                aria-label={item.label}
              >
                <div className={`
                  transition-transform duration-300
                  ${active ? " scale-150" : "scale-100"}
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

 