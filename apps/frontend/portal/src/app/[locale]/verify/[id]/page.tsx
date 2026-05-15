import { 
    getBatchDetails, 
    getBlockchainStatus, 
    getTelemetry, 
    getBlockchainHistory 
} from '@/lib/api';
import { VerifyClient } from './VerifyClient';
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
    
    const productLabel = batch.product_type?.replace(/_/g, ' ') || t('defaultProduct');
    
    return {
        title: `${productLabel} ${t('verified')} | GFTB Trust Passport`,
        description: t('verifyDescription', { 
            product: productLabel, 
            country: batch.origin_country 
        }),
        openGraph: {
            title: `${productLabel} - ${t('blockchainVerified')}`,
            description: t('ogDescription', { id: id.substring(0, 8) }),
            images: [`/api/og/verify/${id}`],
        }
    };
}

export default async function VerifyPage({ params: { locale, id } }: PageProps) {
    unstable_setRequestLocale(locale);
    
    const batchId = id;

    // Fetch all initial data on the server
    const [batchData, bcStatus, telemData, historyData] = await Promise.all([
        getBatchDetails(batchId),
        getBlockchainStatus(batchId),
        getTelemetry(batchId),
        getBlockchainHistory(batchId)
    ]);

    if (!batchData || !bcStatus) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Verification Error</h1>
                <p className="text-gray-500">Could not retrieve secure data for this product.</p>
            </div>
        );
    }

    return (
        <VerifyClient 
            batchId={batchId}
            initialBatch={batchData}
            initialStatus={bcStatus}
            initialTelemetry={telemData}
            initialHistory={historyData}
        />
    );
}

