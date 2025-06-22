import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import Providers from "@/components/providers";
import CustomCursor from "@/components/ui/custom-cursor";

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
                <Header />
                <main className="min-h-[100dvh]  relative">
                    <Providers>{children}</Providers>
                </main>
                <Footer />
            </body>
        </html>
    );
}
