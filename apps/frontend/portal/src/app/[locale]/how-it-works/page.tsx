import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { HowItWorksClient } from './HowItWorksClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
    const { locale } = params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    
    return {
        title: t('how_it_works_title'),
        description: t('how_it_works_description'),
    };
}

export default async function HowItWorksPage({ params: { locale } }: { params: { locale: string } }) {
    unstable_setRequestLocale(locale);
    
    return <HowItWorksClient />;
}
