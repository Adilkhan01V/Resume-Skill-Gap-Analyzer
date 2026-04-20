import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { MainContent } from "./MainContent";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <MainContent>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </MainContent>
    </div>
  );
}
