import { DashboardClient } from './DashboardClient';
import { getBatchDetails } from '@/lib/api';

export const metadata = {
    title: 'Dashboard | GFTB Operations',
    description: 'Monitor your supply chain in real-time with blockchain-verified telemetry.',
};

export default async function DashboardPage() {
    // We can't access localStorage on the server, 
    // so we pass an empty array and let the client hydrate.
    // In a full production app, we would fetch the user's batches from the DB here.
    const initialBatches: any[] = [];

    return (
        <DashboardClient initialBatches={initialBatches} />
    );
}
