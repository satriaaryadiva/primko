"use client";

import { motion } from "framer-motion";

export const ButtonMotion = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
      className="w-full py-3 rounded-xl bg-primary text-secondary font-semibold shadow-md"
    >
      {children}
    </motion.div>
  );
};

export default ButtonMotion;