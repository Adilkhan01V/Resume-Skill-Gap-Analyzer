import { motion } from "framer-motion";

type BadgeProps = {
  label: string;
  tone?: "default" | "accent" | "secondary";
  delay?: number;
};

const toneClasses = {
  default: "bg-secondary/15 text-secondary border-secondary/20",
  accent: "bg-accent/15 text-accent border-accent/20",
  secondary: "bg-primary/15 text-primary border-primary/20"
};

export function Badge({ label, tone = "default", delay = 0 }: BadgeProps) {
  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]}`}
    >
      {label}
    </motion.span>
  );
}
