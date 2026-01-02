import { getBatchDetails, getBlockchainStatus } from '@/lib/api';
import { VerifyClient } from './VerifyClient';
import { notFound } from 'next/navigation';

export default async function VerifyPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const [batch, blockchain] = await Promise.all([
        getBatchDetails(id),
        getBlockchainStatus(id)
    ]);

    if (!batch) {
        notFound();
    }

    return (
        <VerifyClient batch={batch} blockchain={blockchain} />
    );
}
