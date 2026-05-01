import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '../providers/AuthProvider';
import { useDemoState } from '../providers/DemoStateProvider';
import { useBlockchainOperations } from '@/hooks/useBlockchainOperations';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, RefreshCcw } from 'lucide-react';
import { MANUFACTURER_ADDR, LOGISTICS_ADDR, RETAILER_ADDR } from '@/lib/constants';
import { PairSensorModal } from '../iot/PairSensorModal';

// Sub-components
import { ViolationState } from '../blockchain/ViolationState';
import { BlockchainStatusCard } from '../blockchain/BlockchainStatusCard';
import { ManufacturerActions } from '../blockchain/ManufacturerActions';
import { LogisticsActions } from '../blockchain/LogisticsActions';
import { RetailerActions } from '../blockchain/RetailerActions';

interface BlockchainControlsProps {
    batchId: string;
    blockchainStatus: any;
    onRefresh?: () => void;
}

export function BlockchainControls({ batchId, blockchainStatus, onRefresh }: BlockchainControlsProps) {
    const { role } = useAuth();
    const t = useTranslations('Tracking');
    const { getBatchState, updateBatchState, resetBatchState } = useDemoState();
    const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
    
    // Scoped operations hook
    const ops = useBlockchainOperations(batchId);

    // Dynamic state resolution
    const status = getBatchState(batchId) || blockchainStatus;

    const DebugFooter = () => {
        if (role !== 'ADMIN') return null;
        return (
            <div className="mt-8 pt-6 border-t border-primary/10 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    <span className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                        <span className="leading-tight">Protocol Engine v5.0 (Edge)</span>
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[9px] font-black uppercase tracking-widest hover:text-destructive hover:bg-destructive/5 px-4 rounded-full border border-destructive/10 sm:border-transparent transition-all self-start sm:self-auto w-full sm:w-auto"
                        onClick={() => {
                            resetBatchState(batchId);
                            window.location.reload();
                        }}
                    >
                        <RefreshCcw className="h-3 w-3 mr-2" />
                        Reset State
                    </Button>
                </div>
            </div>
        );
    };

    // 1. Violation State (Hard Block)
    if (status.violation) {
        return (
            <ViolationState violation={status.violation} txHash={status.txHash}>
                <DebugFooter />
            </ViolationState>
        );
    }

    // 2. Final Handover Complete
    if (status.handover) {
        return (
            <div className="rounded-3xl bg-emerald-500/[0.03] p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/5 animate-in zoom-in duration-500">
                <div className="flex items-center text-emerald-600 font-serif font-black italic text-2xl mb-3 tracking-tight">
                    <CheckCircle className="mr-3 h-8 w-8 text-emerald-500" />
                    {t('bc_handover_title')}
                </div>
                <p className="text-sm font-bold text-emerald-700/60 leading-relaxed uppercase tracking-wide italic">
                    {t('bc_handover_desc')}
                </p>
                <DebugFooter />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Common Status Display */}
            <BlockchainStatusCard 
                status={status.status}
                owner={status.owner}
                pendingOwner={status.pendingOwner}
                sensorPaired={status.sensorPaired}
            />

            {/* Role-Specific Controls */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {(role === 'MANUFACTURER' || role === 'ADMIN') && (
                    <ManufacturerActions
                        batchId={batchId}
                        isVerified={status.verified}
                        sensorPaired={status.sensorPaired}
                        pendingOwner={status.pendingOwner}
                        owner={status.owner}
                        manufacturerAddr={MANUFACTURER_ADDR}
                        onNotarize={ops.notarize}
                        onPairSensor={() => setIsPairingModalOpen(true)}
                        onTransfer={() => ops.initiateTransfer(LOGISTICS_ADDR)}
                        loading={ops.loading}
                    />
                )}

                {(role === 'LOGISTICS' || role === 'ADMIN') && status.verified && (
                    <LogisticsActions
                        status={status}
                        onAccept={() => ops.acceptTransfer(LOGISTICS_ADDR)}
                        onTransfer={() => ops.initiateTransfer(RETAILER_ADDR)}
                        onReport={() => ops.report("Logistics Compliance Violation")}
                        onStatusUpdate={(id, label) => updateBatchState(batchId, { shippingStatus: id, shippingStatusLabel: label })}
                        loading={ops.loading}
                    />
                )}

                {(role === 'RETAILER' || role === 'ADMIN') && status.verified && (
                    <RetailerActions
                        status={status}
                        onAccept={() => ops.acceptTransfer(RETAILER_ADDR)}
                        onReport={() => ops.report("Retailer Health Safety Alert")}
                        loading={ops.loading}
                    />
                )}

                {/* Default state for unverified non-manufacturers */}
                {!status.verified && role !== 'MANUFACTURER' && role !== 'ADMIN' && (
                    <div className="text-center p-12 bg-muted/20 rounded-[2rem] border-2 border-dashed border-primary/10 flex flex-col items-center justify-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-lg border border-primary/5">
                            <Package className="h-8 w-8 text-primary/20" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-relaxed max-w-[240px]">
                            {t('bc_waiting_manufacturer')}
                        </p>
                    </div>
                )}
            </div>

            <PairSensorModal 
                isOpen={isPairingModalOpen}
                onClose={() => setIsPairingModalOpen(false)}
                batchId={batchId}
                onPair={(sid) => {
                    updateBatchState(batchId, { sensorPaired: true, sensor_id: sid });
                }}
            />

            <DebugFooter />
        </div>
    );
}

