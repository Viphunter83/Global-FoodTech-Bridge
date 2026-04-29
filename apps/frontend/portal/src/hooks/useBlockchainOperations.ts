import { useState } from 'react';
import { useDemoState } from '@/components/providers/DemoStateProvider';
import { auth } from '@/lib/firebase';
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
        actionFn: (token: string) => Promise<{ status: string; txHash?: string; error?: string }>,
        optimisticUpdate?: any,
        successUpdate?: (txHash: string) => any,
        syncToDb?: (txHash: string, token: string) => Promise<any>
    ) => {
        setLoading(true);
        setError(null);

        if (optimisticUpdate) {
            updateBatchState(batchId, optimisticUpdate);
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error('Session expired or not authenticated');

            const res = await actionFn(token);

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
                        await syncToDb(res.txHash, token);
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
        (token) => notarizeBatch(batchId, "hash", token),
        { status: 'Notarizing...', verified: false },
        (txHash) => ({ status: 'Notarized', verified: true, txHash, owner: MANUFACTURER_ADDR }),
        (txHash, token) => updateBatchBlockchainHash(batchId, txHash, token)
    );

    const initiateTransfer = (toAddress: string) => handleAction(
        (token) => initiateHandover(batchId, toAddress, token),
        { pendingOwner: toAddress },
        () => ({ pendingOwner: toAddress })
    );

    const acceptTransfer = (newOwner: string) => handleAction(
        (token) => acceptHandover(batchId, token),
        { status: 'Accepting...' },
        (txHash) => ({ owner: newOwner, pendingOwner: null, txHash }),
        (txHash, token) => updateBatchBlockchainHash(batchId, txHash, token)
    );

    const report = (details: string) => handleAction(
        (token) => reportViolation(batchId, details, token),
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
