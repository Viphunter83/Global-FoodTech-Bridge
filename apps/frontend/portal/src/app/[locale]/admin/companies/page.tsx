import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { AdminCompaniesClient } from './AdminCompaniesClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
    const { locale } = params;
    const t = await getTranslations({ locale, namespace: 'Admin' });
    
    return {
        title: `${t('companies_title')} | GFTB Admin`,
        description: t('companies_subtitle'),
    };
}

export default function AdminCompaniesPage({ params: { locale } }: { params: { locale: string } }) {
    unstable_setRequestLocale(locale);
    
    return <AdminCompaniesClient />;
}
