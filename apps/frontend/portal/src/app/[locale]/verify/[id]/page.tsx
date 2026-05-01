import { 
    getBatchDetails, 
    getBlockchainStatus, 
    getTelemetry, 
    getBlockchainHistory 
} from '@/lib/api';
import { VerifyClient } from './VerifyClient';
import { Metadata } from 'next';

interface PageProps {
    params: {
        id: string;
        locale: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const batch = await getBatchDetails(params.id);
    if (!batch) return { title: 'Product Not Found | GFTB Verify' };
    
    const productLabel = batch.product_type?.replace(/_/g, ' ') || 'Food Product';
    return {
        title: `${productLabel} Verified | GFTB Trust Passport`,
        description: `Verify the authenticity and cold chain integrity of ${productLabel} from ${batch.origin_country}. Blockchain-secured provenance.`,
        openGraph: {
            title: `${productLabel} - Blockchain Verified`,
            description: `Official digital passport for batch #${params.id.substring(0, 8)}.`,
            images: [`/api/og/verify/${params.id}`], // Assuming an OG image generator exists or will be added
        }
    };
}

export default async function VerifyPage({ params }: PageProps) {
    const batchId = params.id;

    // Fetch all initial data on the server
    const [batchData, bcStatus, telemData, historyData] = await Promise.all([
        getBatchDetails(batchId),
        getBlockchainStatus(batchId),
        getTelemetry(batchId),
        getBlockchainHistory(batchId)
    ]);

    if (!batchData || !bcStatus) {
        // This will be caught by the client or shown as unverified
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
