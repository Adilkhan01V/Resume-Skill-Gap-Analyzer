import { motion } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary/40",
  secondary:
    "bg-secondary text-white hover:bg-secondary/90 focus-visible:ring-secondary/40"
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      type="button"
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
