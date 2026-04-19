import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import "../globals.css";
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
    icons: {
        icon: "/favicon.svg",
    },
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { DemoStateProvider } from "@/components/providers/DemoStateProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/navigation';

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const locale = params.locale;

    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale} className={`${outfit.variable} ${cormorant.variable}`} suppressHydrationWarning>
            <body className="font-sans antialiased text-foreground bg-background selection:bg-primary/20 selection:text-primary">
                <NextIntlClientProvider messages={messages}>
                    <AuthProvider>
                        <DemoStateProvider>
                            <div className="relative flex min-h-screen flex-col">
                                <Header />
                                <div className="flex-1">{children}</div>
                            </div>
                        </DemoStateProvider>
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

