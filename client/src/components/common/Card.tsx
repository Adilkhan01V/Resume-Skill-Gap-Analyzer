import { ReactNode } from "react";
import { motion } from "framer-motion";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`surface-card p-4 md:p-5 ${className}`}
    >
      {children}
    </motion.section>
  );
}
