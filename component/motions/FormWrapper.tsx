"use client";

import { motion } from "framer-motion";

export default function LayoutWrapper({
   children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay,
        ease: "easeOut",
      }}
      className={ className }
    >
      {children}
    </motion.div>
  );
}
