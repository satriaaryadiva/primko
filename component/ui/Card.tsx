"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  bgGradient?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-md p-6 ${
        hover ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function GradientCard({ children, className = "" }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-linear-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl p-6 text-white ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ 
  icon, 
  label, 
  value, 
  bgGradient,
  trend ,
}: { 
  icon: ReactNode; 
  label: string; 
  bgGradient?: boolean;
  value: string | number; 
  trend?: string;
}) {
  return (
    <Card bgGradient={bgGradient} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2">↗ {trend}</p>
          )}
        </div>
        <div className="bg-blue-100 p-3 rounded-xl">
          {icon}
        </div>
      </div>
    </Card>
  );
}