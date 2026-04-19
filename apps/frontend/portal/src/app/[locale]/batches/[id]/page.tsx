import { getBatchDetails, getTelemetry, getBlockchainStatus, getAlerts, getBlockchainHistory } from '@/lib/api';
import { BatchDetailsClient } from './BatchDetailsClient';
import { notFound } from 'next/navigation';

export default async function BatchDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;

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
