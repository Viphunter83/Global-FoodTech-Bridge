import { getBatchDetails, getBlockchainStatus } from '@/lib/api';
import { ScanClient } from './ScanClient';
import { Metadata } from 'next';

interface PageProps {
    params: {
        id: string;
        locale: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const batch = await getBatchDetails(params.id);
    if (!batch) return { title: 'Batch Not Found | GFTB' };
    
    return {
        title: `Verify Batch ${params.id.substring(0, 8)} | GFTB`,
        description: `Verify and track the logistics state for batch #${params.id}.`,
    };
}

export default async function ScanPage({ params }: PageProps) {
    const batchId = params.id;

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
