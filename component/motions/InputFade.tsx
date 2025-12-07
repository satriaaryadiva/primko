"use client";

import { motion } from "framer-motion";

export default function InputFade({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
