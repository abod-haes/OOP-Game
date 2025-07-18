import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import CustomCursor from "@/components/ui/custom-cursor";
import NavigationLoaderProvider from "@/components/ui/navigation-loader-provider";
import LayoutWrapper from "./layout-wrapper";

export const metadata: Metadata = {
  title: "OOP Game",
  description: "The best game to learn oop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CustomCursor />
        <NavigationLoaderProvider>
          <LayoutWrapper>
            <Providers>{children}</Providers>
          </LayoutWrapper>
        </NavigationLoaderProvider>
      </body>
    </html>
  );
}
