import { ReactNode } from "react";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { DemoStateProvider } from "@/components/providers/DemoStateProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, getMessages } from 'next-intl/server';
import { ClientHydrationLog } from "../../components/ClientHydrationLog";
import { Header } from "@/components/Header";
import { AlertSentinel } from "@/components/AlertSentinel";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        title: {
            default: t('title'),
            template: `%s | ${t('title')}`,
        },
        description: t('description'),
        keywords: ['food traceability', 'blockchain', 'supply chain', 'cold chain monitoring', 'halal certification', 'IoT sensors', 'Polygon', 'food safety', 'digital passport'],
        authors: [{ name: 'Global FoodTech Bridge' }],
        creator: 'Global FoodTech Bridge',
        openGraph: {
            type: 'website',
            siteName: 'Global FoodTech Bridge',
            title: t('og_title'),
            description: t('og_description'),
            locale: locale === 'en' ? 'en_US' : locale,
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description'),
        },
        robots: {
            index: true,
            follow: true,
        },
        metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gftb.app'),
        icons: {
            icon: [
                { url: '/favicon.svg', type: 'image/svg+xml' },
            ],
            apple: [
                { url: '/favicon.svg' },
            ],
        },
    };
}

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

export default async function LocaleLayout({
    children,
    params: { locale },
}: {
    children: ReactNode;
    params: { locale: string };
}) {
    // Providing all messages to the client
    const messages = await getMessages();
    
    // Server-side diagnostic
    console.log(`[LocaleLayout] Rendering locale: ${locale}, messages found: ${messages ? Object.keys(messages).length : 0}`);

    return (
        <html lang={locale} suppressHydrationWarning>
            <body 
                className={`${outfit.variable} ${cormorant.variable} font-sans antialiased text-foreground bg-background`}
                suppressHydrationWarning
            >
                <NextIntlClientProvider messages={messages} locale={locale} timeZone="UTC">
                    <ClientHydrationLog />
                    <AuthProvider>
                        <NotificationProvider>
                            <AlertSentinel />
                            <DemoStateProvider>
                                <div className="relative flex min-h-screen flex-col">
                                    {/* Skip-to-content accessibility link */}
                                    <a 
                                        href="#main-content" 
                                        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-white focus:rounded-xl focus:shadow-2xl focus:text-sm focus:font-bold focus:outline-none"
                                    >
                                        Skip to main content
                                    </a>
                                    <Header />
                                    <main id="main-content" className="flex-1">{children}</main>
                                </div>
                            </DemoStateProvider>
                        </NotificationProvider>
                    </AuthProvider>
                    <Toaster position="bottom-right" richColors closeButton />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
