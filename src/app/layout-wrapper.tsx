"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Check if the path matches the level pattern (two UUID segments)
  const isLevelPage =
    /^\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
      pathname
    );

  // If it's a level page, render only the children (no header/footer)
  if (isLevelPage) {
    return <main className="h-screen relative">{children}</main>;
  }

  // For regular pages, render header, children, and footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
