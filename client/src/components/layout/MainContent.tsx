import { ReactNode } from "react";

type MainContentProps = {
  children: ReactNode;
};

export function MainContent({ children }: MainContentProps) {
  return <main className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6">{children}</main>;
}
