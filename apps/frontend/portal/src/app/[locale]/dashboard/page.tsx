import { DashboardClient } from './DashboardClient';
import { getBatchDetails } from '@/lib/api';
import { Metadata } from 'next';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

interface PageProps {
    params: {
        locale: string;
    };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'Dashboard' });
    
    return {
        title: `${t('operations_title')} | GFTB`,
        description: t('action_desc'),
    };
}

export default async function DashboardPage({ params: { locale } }: PageProps) {
    unstable_setRequestLocale(locale);
    
    // We can't access localStorage on the server, 
    // so we pass an empty array and let the client hydrate.
    // In a full production app, we would fetch the user's batches from the DB here.
    const initialBatches: any[] = [];

    return (
        <DashboardClient initialBatches={initialBatches} />
    );
}

