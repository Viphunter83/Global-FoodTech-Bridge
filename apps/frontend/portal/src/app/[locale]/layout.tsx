import { ReactNode } from "react";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DemoStateProvider } from "@/components/providers/DemoStateProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ClientHydrationLog } from "../../components/ClientHydrationLog";
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
