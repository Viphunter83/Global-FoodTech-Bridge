import { getBatchDetails, getBlockchainStatus } from '@/lib/api';
import { ScanClient } from './ScanClient';
import { Metadata } from 'next';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

interface PageProps {
    params: {
        id: string;
        locale: string;
    };
}

export async function generateMetadata({ params: { locale, id } }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'Verify' });
    const batch = await getBatchDetails(id);
    
    if (!batch) return { title: t('notFound') };
    
    return {
        title: `${t('scanTitle')} ${id.substring(0, 8)} | GFTB`,
        description: t('scanDescription', { id }),
    };
}

export default async function ScanPage({ params: { locale, id } }: PageProps) {
    unstable_setRequestLocale(locale);
    
    const batchId = id;

    // Fetch initial data on the server
    const [batchData, bcStatus] = await Promise.all([
        getBatchDetails(batchId),
        getBlockchainStatus(batchId)
    ]);

    if (!batchData || !bcStatus) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Scan Error</h1>
                <p className="text-gray-500">The batch data could not be retrieved from the trust ledger.</p>
            </div>
        );
    }

    return (
        <ScanClient 
            batchId={batchId}
            initialBatch={batchData}
            initialStatus={bcStatus}
        />
    );
}

