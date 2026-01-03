'use client';

import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useLanguage } from '../providers/LanguageProvider';
import { useDemoState } from '../providers/DemoStateProvider';
import { notarizeBatch, initiateHandover, acceptHandover, reportViolation } from '@/lib/api';
import { Button } from './button';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle, Truck, PackageCheck, Thermometer } from 'lucide-react';
import { MANUFACTURER_ADDR, LOGISTICS_ADDR, RETAILER_ADDR } from '@/lib/constants';

interface BlockchainControlsProps {
    batchId: string;
    // We still accept initial/prop status, but we'll primarily rely on Context for interactivity
    blockchainStatus: any;
    onRefresh?: () => void; // Made optional as we might not need it
}

export function BlockchainControls({ batchId, blockchainStatus }: BlockchainControlsProps) {
    const { role } = useAuth();
    const { t } = useLanguage();
    // Use scoped batch state
    const { getBatchState, updateBatchState, resetBatchState } = useDemoState();
    const [loading, setLoading] = useState(false);

    // Use specific batch status or fallback to props
    const status = getBatchState(batchId) || blockchainStatus;

    const DebugFooter = () => (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-300 font-mono">v3.2-pairing</span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-gray-400 hover:text-red-500"
                    onClick={() => {
                        resetBatchState(batchId);
                        window.location.reload();
                    }}
                >
                    Reset Demo
                </Button>
            </div>
            {/* Live State Debugger */}
            <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-2 rounded">
                <div>Owner: {status.owner || 'None'}</div>
                <div>Status: {status.status}</div>
                <div>Paired: {status.sensorPaired ? 'Yes' : 'No'}</div>
            </div>
        </div>
    );

    const handleNotarize = async () => {
        setLoading(true);
        // Optimistic update first
        updateBatchState(batchId, { verified: true, status: 'Notarized', owner: MANUFACTURER_ADDR, txHash: 'Pending...' });

        const res = await notarizeBatch(batchId, `hash_${Date.now()}`);

        if (res.txHash) {
            updateBatchState(batchId, { verified: true, status: 'Notarized', owner: MANUFACTURER_ADDR, txHash: res.txHash });
        }
        setLoading(false);
    };

    const handlePairSensor = async () => {
        setLoading(true);
        // Simulate scanning delay
        await new Promise(resolve => setTimeout(resolve, 800));
        updateBatchState(batchId, { sensorPaired: true });
        setLoading(false);
    };

    const handleInitiateHandover = async () => {
        setLoading(true);
        alert("Use role-specific buttons.");
        setLoading(false);
    };

    const handleAcceptHandover = async () => {
        setLoading(true);
        const newOwner = status.pendingOwner || "0xUnknown";
        // Only mark workflow as "Complete" (handover: true) if Retailer has accepted
        const isFinal = newOwner === RETAILER_ADDR;
        updateBatchState(batchId, { handover: isFinal, owner: newOwner, pendingOwner: null });

        const res = await acceptHandover(batchId);
        setLoading(false);
        if (res.error && !res.txHash?.includes('demo')) {
            alert(t('bc_processing') + " Failed: " + res.error);
        }
    };

    const handleReport = async () => {
        setLoading(true);
        updateBatchState(batchId, { violation: "Manual Safety Report" });
        await reportViolation(batchId, "Manual Safety Report");
        setLoading(false);
    };

    const handleTransferToLogistics = async () => {
        setLoading(true);
        updateBatchState(batchId, { pendingOwner: LOGISTICS_ADDR });
        const res = await initiateHandover(batchId, LOGISTICS_ADDR);
        setLoading(false);
        if (res.error && !res.txHash?.includes('demo')) {
            alert(t('bc_processing') + " Failed: " + res.error);
        }
    };

    const handleDispatch = async () => {
        setLoading(true);
        console.log("Dispatching batch...");
        alert(t('alert_dispatched'));
        setLoading(false);
    };

    const handleTransferToRetailer = async () => {
        setLoading(true);
        updateBatchState(batchId, { pendingOwner: RETAILER_ADDR });
        const res = await initiateHandover(batchId, RETAILER_ADDR);
        setLoading(false);
        if (res.error && !res.txHash?.includes('demo')) {
            alert(t('bc_processing') + " Failed: " + res.error);
        }
    };

    if (loading) {
        return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('bc_processing')}</Button>;
    }

    // 1. Violation State (High Alert)
    if (status.violation) {
        return (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex items-center text-red-700 font-bold mb-2">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    {t('bc_violation_title')}
                </div>
                <p className="text-sm text-red-600 mb-2">{t('bc_violation_details')} {status.violation}</p>
                <div className="text-xs font-mono text-gray-500 bg-white p-1 rounded inline-block">
                    Tx: {status.txHash?.substring(0, 16)}...
                </div>
                <DebugFooter />
            </div>
        );
    }

    // 2. Handover Complete (Retailer Accepted)
    if (status.handover) {
        return (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex items-center text-green-700 font-bold">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {t('bc_handover_title')}
                </div>
                <p className="text-sm text-green-600 mt-1">{t('bc_handover_desc')}</p>
                <DebugFooter />
            </div>
        );
    }

    // 3. Notarized (In Progress Flow)
    if (status.verified) {
        return (
            <div className="space-y-4">
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                    <div className="flex items-center text-blue-700 font-bold">
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        {t('bc_secured_title')}
                    </div>
                    <p className="text-sm text-blue-600 mt-1">{t('bc_secured_desc')}</p>
                    {status.pendingOwner && (
                        <div className="mt-2 text-xs bg-white/50 p-2 rounded text-blue-800">
                            <strong>Status:</strong> Transfer Pending to {status.pendingOwner.substring(0, 10)}...
                        </div>
                    )}
                    {status.owner && (
                        <div className="mt-1 text-xs text-blue-800/70">
                            Current Owner: {status.owner?.substring(0, 15)}...
                        </div>
                    )}
                    {status.sensorPaired && (
                        <div className="mt-1 text-xs text-green-700 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Tive Sensor Paired
                        </div>
                    )}
                </div>

                {/* LOGISTICS ROLE */}
                {role === 'LOGISTICS' && (
                    <div className="space-y-2">
                        {/* A. Accept Incoming (Pending for US) */}
                        {status.pendingOwner === LOGISTICS_ADDR && (
                            <Button
                                onClick={handleAcceptHandover}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                <PackageCheck className="mr-2 h-4 w-4" />
                                {t('btn_accept_custody')}
                            </Button>
                        )}

                        {/* B. Dispatch/Forward (We are Owner, No Pending Transfer) */}
                        {status.owner === LOGISTICS_ADDR && !status.pendingOwner && (
                            <div className="flex flex-col gap-2">
                                <Button onClick={handleDispatch} variant="outline" className="w-full border-blue-600 text-blue-600">
                                    <Truck className="mr-2 h-4 w-4" />
                                    {t('btn_dispatch_truck')}
                                </Button>
                                <Button onClick={handleTransferToRetailer} variant="outline" className="w-full">
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    {t('btn_transfer_retailer')}
                                </Button>
                            </div>
                        )}

                        {/* C. Waiting State */}
                        {status.owner !== LOGISTICS_ADDR && status.pendingOwner !== LOGISTICS_ADDR && (
                            <div className="text-center text-sm text-gray-500 py-2 italic bg-gray-50 rounded">
                                {t('bc_waiting_manufacturer')}
                            </div>
                        )}

                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white mt-2" onClick={handleReport}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            {t('btn_report')}
                        </Button>
                    </div>
                )}

                {/* RETAILER ROLE */}
                {role === 'RETAILER' && (
                    <div className="rounded-md bg-slate-50 p-4 border border-slate-200 space-y-3">
                        <h4 className="font-semibold text-sm">{t('retailer_checkpoint')}</h4>
                        <div className="flex flex-col gap-2">
                            {/* A. Accept Incoming (Pending for US) */}
                            {status.pendingOwner === RETAILER_ADDR && (
                                <Button onClick={handleAcceptHandover} className="w-full h-auto py-2 whitespace-normal bg-green-600 hover:bg-green-700 text-white flex flex-col sm:flex-row items-center justify-center gap-2">
                                    <PackageCheck className="h-4 w-4 shrink-0" />
                                    <span className="text-center">{t('btn_accept_handover')}</span>
                                </Button>
                            )}

                            {/* B. Waiting State */}
                            {status.pendingOwner !== RETAILER_ADDR && (
                                <div className="text-center text-sm text-gray-500 py-2">
                                    {t('bc_waiting_logistics')}
                                </div>
                            )}

                            <Button variant="outline" onClick={handleReport} className="w-full h-auto py-2 whitespace-normal text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex flex-col sm:flex-row items-center justify-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span className="text-center">{t('report_issue_btn')}</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* MANUFACTURER ROLE (Inside Verified Block) */}
                {role === 'MANUFACTURER' && (
                    <div className="mt-2 space-y-3">
                        {/* 1. Pair Sensor (If verified but not paired) */}
                        {!status.sensorPaired && !status.pendingOwner && status.owner === MANUFACTURER_ADDR && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="text-sm text-yellow-800 mb-2 font-medium">Action Required: Pair IoT Sensor</div>
                                <Button onClick={handlePairSensor} variant="secondary" className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                                    <Thermometer className="mr-2 h-4 w-4" />
                                    Pair Tive Sensor
                                </Button>
                            </div>
                        )}

                        {/* 2. Initiate Transfer (Only if Paired) */}
                        {status.owner === MANUFACTURER_ADDR && !status.pendingOwner && status.sensorPaired && (
                            <Button onClick={handleTransferToLogistics} variant="outline" className="w-full border-blue-200 hover:bg-blue-50">
                                <Truck className="mr-2 h-4 w-4" />
                                {t('btn_transfer_logistics')}
                            </Button>
                        )}

                        {/* 3. Pending State */}
                        {status.pendingOwner && (
                            <div className="text-sm text-gray-500 text-center italic mt-2">
                                Waiting for Logistics to accept...
                            </div>
                        )}

                        {/* 4. Completed Transfer (We are NOT owner) */}
                        {status.owner !== MANUFACTURER_ADDR && !status.pendingOwner && (
                            <div className="text-sm text-green-600 text-center italic mt-2">
                                Handover to Logistics verified.
                            </div>
                        )}
                    </div>
                )}
                <DebugFooter />
            </div>
        );
    }

    // 4. Initial State (Not Notarized)
    if (role === 'MANUFACTURER') {
        return (
            <div className="flex flex-col gap-3">
                <Button
                    variant="outline"
                    onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${batchId}`, '_blank')}
                    className="w-full"
                >
                    <div className="flex items-center justify-center">
                        <svg className="mr-2 h-4 w-4" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><rect height="18" rx="2" ry="2" width="18" x="3" y="3" /><path d="M7 7h3v3H7z" /><path d="M14 7h3v3h-3z" /><path d="M7 14h3v3H7z" /><path d="M14 14h3v3h-3z" /></svg>
                        {t('btn_print_qr')}
                    </div>
                </Button>
                <div className="pt-2">
                    <Button onClick={handleNotarize} className="w-full bg-purple-600 hover:bg-purple-700">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {t('btn_notarize')}
                    </Button>
                    <DebugFooter />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500 italic text-center mb-2">{t('bc_waiting_manufacturer')}</div>
            <DebugFooter />
        </div>
    );
}
