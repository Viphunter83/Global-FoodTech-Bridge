import { useState } from 'react';
import { useDemoState } from '@/components/providers/DemoStateProvider';
import { auth } from '@/lib/firebase';
import { 
    notarizeBatch, 
    initiateHandover, 
    acceptHandover, 
    reportViolation, 
    updateBatchBlockchainHash,
    resetBatchDemo,
    updateBatchIOTConfig,
    unbindBatchSensors
} from '@/lib/api';
import { toast } from 'sonner';

export function useBlockchainOperations(batchId: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getBatchState, updateBatchState, resetBatchState } = useDemoState();

    const handleAction = async (
        actionFn: (token: string) => Promise<{ status: string; txHash?: string; error?: string }>,
        optimisticUpdate?: any,
        successUpdate?: (txHash: string) => any,
        syncToDb?: (txHash: string, token: string) => Promise<any>
    ) => {
        setLoading(true);
        setError(null);

        // Snapshot so a failed operation does not leave the optimistic state behind
        // (local state overrides the backend status in the UI)
        const previousState = getBatchState(batchId);
        const rollback = () => {
            if (!optimisticUpdate) return;
            resetBatchState(batchId);
            if (previousState) updateBatchState(batchId, previousState);
        };

        if (optimisticUpdate) {
            updateBatchState(batchId, optimisticUpdate);
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error('Session expired or not authenticated');

            const res = await actionFn(token);

            if (res.error) {
                rollback();
                setError(res.error);
                toast.error(`Operation failed: ${res.error}`);
                return { success: false, error: res.error };
            }

            if (res.txHash) {
                toast.success('Blockchain transaction confirmed', {
                    description: `Transaction: ${res.txHash.substring(0, 16)}...`
                });
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
            
            toast.success('Action successfully recorded');
            return { success: true };
        } catch (err: any) {
            rollback();
            const msg = err.message || 'Unknown error';
            setError(msg);
            toast.error(`Error: ${msg}`);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const notarize = () => handleAction(
        // The backend anchors the batch's own IPFS metadata URI from the passport
        (token) => notarizeBatch(batchId, undefined, token),
        { status: 'Notarizing...', verified: false },
        (txHash) => ({ status: 'Notarized', verified: true, txHash, ownerRole: 'MANUFACTURER' }),
        (txHash, token) => updateBatchBlockchainHash(batchId, txHash, token)
    );

    const initiateTransfer = (toRole: 'LOGISTICS' | 'RETAILER') => handleAction(
        (token) => initiateHandover(batchId, toRole, token),
        { pendingOwnerRole: toRole },
        () => ({ pendingOwnerRole: toRole })
    );

    const acceptTransfer = (newRole: 'LOGISTICS' | 'RETAILER') => handleAction(
        (token) => acceptHandover(batchId, token),
        { status: 'Accepting...' },
        (txHash) => ({ ownerRole: newRole, pendingOwnerRole: null, pendingOwner: null, txHash }),
        (txHash, token) => updateBatchBlockchainHash(batchId, txHash, token)
    );

    const report = (details: string) => handleAction(
        (token) => reportViolation(batchId, details, token),
        { status: 'Reporting...' },
        (txHash) => ({ violation: details, txHash })
    );

    const reset = () => handleAction(
        async (token) => {
            const res = await resetBatchDemo(batchId, token);
            return { status: 'success' };
        },
        null,
        () => {
            // After successful backend reset, we reset the local demo state
            return {
                status: 'Initial',
                verified: false,
                owner: null,
                pendingOwner: null,
                txHash: null,
                violation: null,
                shippingStatus: null
            };
        }
    );

    const pairSensor = (sensorIds: string[], startTracking: boolean) => handleAction(
        (token) => updateBatchIOTConfig(batchId, {
            sensor_ids: sensorIds,
            start_tracking: startTracking
        }, token),
        { 
            sensorPaired: true, 
            sensor_ids: sensorIds,
            tracking_started: startTracking
        },
        () => ({ 
            sensorPaired: true, 
            sensor_ids: sensorIds,
            tracking_started: startTracking
        })
    );

    const unbindSensor = () => handleAction(
        (token) => unbindBatchSensors(batchId, token),
        { sensorPaired: false, sensor_ids: [] },
        () => ({ sensorPaired: false, sensor_ids: [] })
    );

    return {
        loading,
        error,
        notarize,
        initiateTransfer,
        acceptTransfer,
        report,
        reset,
        pairSensor,
        unbindSensor
    };
}
