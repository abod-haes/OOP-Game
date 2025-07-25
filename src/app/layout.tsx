import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import NavigationLoaderProvider from "@/components/ui/navigation-loader-provider";
import LayoutWrapper from "./layout-wrapper";
// import { AuthDebug } from "@/components/auth-debug";

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
        <NavigationLoaderProvider>
          <LayoutWrapper>
            <Providers>{children}</Providers>
          </LayoutWrapper>
        </NavigationLoaderProvider>
        {/* Disabled AuthDebug to reduce memory usage */}
        {/* <AuthDebug /> */}
      </body>
    </html>
  );
}
