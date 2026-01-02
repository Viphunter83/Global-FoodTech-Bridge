import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Basic font
import "./globals.css";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Global FoodTech Bridge",
    description: "Supply Chain Manager",
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <div className="relative flex min-h-screen flex-col">
                        <Header />
                        <div className="flex-1">{children}</div>
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
