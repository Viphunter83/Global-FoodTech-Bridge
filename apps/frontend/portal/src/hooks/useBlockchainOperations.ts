import { useState } from 'react';
import { useDemoState } from '@/components/providers/DemoStateProvider';
import { 
    notarizeBatch, 
    initiateHandover, 
    acceptHandover, 
    reportViolation, 
    updateBatchBlockchainHash 
} from '@/lib/api';
import { MANUFACTURER_ADDR } from '@/lib/constants';

export function useBlockchainOperations(batchId: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { updateBatchState } = useDemoState();

    const handleAction = async (
        actionFn: () => Promise<{ status: string; txHash?: string; error?: string }>,
        optimisticUpdate?: any,
        successUpdate?: (txHash: string) => any,
        syncToDb?: (txHash: string) => Promise<any>
    ) => {
        setLoading(true);
        setError(null);

        if (optimisticUpdate) {
            updateBatchState(batchId, optimisticUpdate);
        }

        try {
            const res = await actionFn();

            if (res.error) {
                setError(res.error);
                // Rollback or handle error state if needed
                return { success: false, error: res.error };
            }

            if (res.txHash) {
                if (successUpdate) {
                    updateBatchState(batchId, successUpdate(res.txHash));
                }

                if (syncToDb) {
                    try {
                        await syncToDb(res.txHash);
                    } catch (e) {
                        console.error('Failed to sync to DB:', e);
                    }
                }
                return { success: true, txHash: res.txHash };
            }
            
            return { success: true };
        } catch (err: any) {
            setError(err.message || 'Unknown error');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const notarize = () => handleAction(
        () => notarizeBatch(batchId),
        { status: 'Notarizing...', verified: false },
        (txHash) => ({ status: 'Notarized', verified: true, txHash, owner: MANUFACTURER_ADDR }),
        (txHash) => updateBatchBlockchainHash(batchId, txHash)
    );

    const initiateTransfer = (toAddress: string) => handleAction(
        () => initiateHandover(batchId, toAddress),
        { pendingOwner: toAddress },
        () => ({ pendingOwner: toAddress })
    );

    const acceptTransfer = (newOwner: string) => handleAction(
        () => acceptHandover(batchId),
        { status: 'Accepting...' },
        (txHash) => ({ owner: newOwner, pendingOwner: null, txHash }),
        (txHash) => updateBatchBlockchainHash(batchId, txHash)
    );

    const report = (details: string) => handleAction(
        () => reportViolation(batchId, details),
        { status: 'Reporting...' },
        (txHash) => ({ violation: details, txHash })
    );

    return {
        loading,
        error,
        notarize,
        initiateTransfer,
        acceptTransfer,
        report
    };
}
