import { getBatchDetails, getTelemetry, getBlockchainStatus, getAlerts, getBlockchainHistory } from '@/lib/api';
import { BatchDetailsClient } from './BatchDetailsClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

interface PageProps {
    params: {
        id: string;
        locale: string;
    };
}

export async function generateMetadata({ params: { locale, id } }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'Batches' });
    const batch = await getBatchDetails(id);
    
    if (!batch) return { title: t('notFound') };
    
    return {
        title: `${t('detailsTitle')} #${id.substring(0, 8)} | GFTB`,
        description: t('detailsDescription', { id }),
    };
}

export default async function BatchDetailsPage({ params: { locale, id } }: PageProps) {
    unstable_setRequestLocale(locale);

    const batch = await getBatchDetails(id);
    if (!batch) {
        notFound();
    }

    // Parallel data fetching with SLA limits
    const [telemetry, blockchain, alerts, bcHistory] = await Promise.all([
        getTelemetry(id, batch.min_temp ?? -22, batch.max_temp ?? -18),
        getBlockchainStatus(id),
        getAlerts(id),
        getBlockchainHistory(id),
    ]);

    return (
        <BatchDetailsClient
            batch={batch}
            telemetry={telemetry}
            blockchain={blockchain}
            alerts={alerts}
            bcHistory={bcHistory}
        />
    );
}

