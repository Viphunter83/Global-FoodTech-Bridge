import { getBatchDetails, getTelemetry, getBlockchainStatus, getAlerts } from '@/lib/api';
import { BatchDetailsClient } from './BatchDetailsClient';
import { notFound } from 'next/navigation';

export default async function BatchDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // Parallel data fetching
    const [batch, telemetry, blockchain, alerts] = await Promise.all([
        getBatchDetails(id),
        getTelemetry(id),
        getBlockchainStatus(id),
        getAlerts(id),
    ]);

    if (!batch) {
        notFound();
    }

    return (
        <BatchDetailsClient
            batch={batch}
            telemetry={telemetry}
            blockchain={blockchain}
            alerts={alerts}
        />
    );
}
