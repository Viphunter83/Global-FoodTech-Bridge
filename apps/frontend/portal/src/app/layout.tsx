import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const outfit = Outfit({ 
    subsets: ["latin", "latin-ext"],
    variable: '--font-outfit',
    display: 'swap',
});

const cormorant = Cormorant_Garamond({
    subsets: ["latin", "latin-ext", "cyrillic", "vietnamese"],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-cormorant',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "GFTB Bridge | Global FoodTech Transparency",
    description: "International supply chain bridge protected by IoT and Blockchain.",
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { DemoStateProvider } from "@/components/providers/DemoStateProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${outfit.variable} ${cormorant.variable}`}>
            <body className="font-sans antialiased text-foreground bg-background selection:bg-primary/20 selection:text-primary">
                <AuthProvider>
                    <LanguageProvider>
                        <DemoStateProvider>
                            <div className="relative flex min-h-screen flex-col">
                                <Header />
                                <div className="flex-1">{children}</div>
                            </div>
                        </DemoStateProvider>
                    </LanguageProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
