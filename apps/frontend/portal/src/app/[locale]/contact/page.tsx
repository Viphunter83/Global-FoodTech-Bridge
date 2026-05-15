import { ContactClient } from './ContactClient';
import { Metadata } from 'next';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

interface PageProps {
    params: {
        locale: string;
    };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'Marketing' });
    
    return {
        title: `${t('contact_sales')} | GFTB`,
        description: t('merchant_funnel_desc'),
    };
}

export default async function ContactPage({ params: { locale } }: PageProps) {
    unstable_setRequestLocale(locale);
    
    return <ContactClient />;
}

