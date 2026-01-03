'use client';

import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useLanguage } from '../providers/LanguageProvider';
import { notarizeBatch, initiateHandover, acceptHandover, reportViolation } from '@/lib/api';
import { Button } from './button';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle, Truck, PackageCheck } from 'lucide-react';

interface BlockchainControlsProps {
    batchId: string;
    blockchainStatus: {
        verified: boolean;
        handover?: boolean;
        violation?: string | null;
        txHash?: string;
        pendingOwner?: string | null;
    };
}

export function BlockchainControls({ batchId, blockchainStatus }: BlockchainControlsProps) {
    const { role } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const handleNotarize = async () => {
        setLoading(true);
        await notarizeBatch(batchId, `hash_${Date.now()}`);
        setLoading(false);
        window.location.reload();
    };

    const handleInitiateHandover = async () => {
        setLoading(true);
        // Hardcoded Retailer Address for MVP
        await initiateHandover(batchId, "0xRetailerAddress");
        setLoading(false);
        window.location.reload();
    };

    const handleAcceptHandover = async () => {
        setLoading(true);
        await acceptHandover(batchId);
        setLoading(false);
        window.location.reload();
    };

    const handleReport = async () => {
        setLoading(true);
        await reportViolation(batchId, "Manual Safety Report");
        setLoading(false);
        window.location.reload();
    };

    const handleTransferToLogistics = async () => {
        setLoading(true);
        await initiateHandover(batchId, "0xLogisticsAddress");
        setLoading(false);
        window.location.reload();
    };

    const handleDispatch = async () => {
        setLoading(true);
        // Mock Dispatch Event - In real app this calls backend to set status='In Transit'
        console.log("Dispatching batch...");
        // await dispatchBatch(batchId); 
        alert(t('alert_dispatched'));
        setLoading(false);
    };

    const handleTransferToRetailer = async () => {
        setLoading(true);
        await initiateHandover(batchId, "0xRetailerAddress");
        setLoading(false);
        window.location.reload();
    };

    if (loading) {
        return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('bc_processing')}</Button>;
    }

    // 1. Violation State (High Alert)
    if (blockchainStatus.violation) {
        return (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex items-center text-red-700 font-bold mb-2">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    {t('bc_violation_title')}
                </div>
                <p className="text-sm text-red-600 mb-2">{t('bc_violation_details')} {blockchainStatus.violation}</p>
                <div className="text-xs font-mono text-gray-500 bg-white p-1 rounded inline-block">
                    Tx: {blockchainStatus.txHash?.substring(0, 16)}...
                </div>
            </div>
        );
    }

    // 2. Handover Complete
    if (blockchainStatus.handover) {
        return (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex items-center text-green-700 font-bold">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {t('bc_handover_title')}
                </div>
                <p className="text-sm text-green-600 mt-1">{t('bc_handover_desc')}</p>
            </div>
        );
    }

    // 3. Notarized (In Transit)
    if (blockchainStatus.verified) {
        return (
            <div className="space-y-4">
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                    <div className="flex items-center text-blue-700 font-bold">
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        {t('bc_secured_title')}
                    </div>
                    <p className="text-sm text-blue-600 mt-1">{t('bc_secured_desc')}</p>
                    {blockchainStatus.pendingOwner && (
                        <div className="mt-2 text-xs bg-white/50 p-2 rounded text-blue-800">
                            <strong>Status:</strong> Transfer Pending
                        </div>
                    )}
                </div>

                {/* Logistics Actions */}
                {role === 'LOGISTICS' && (
                    <div className="space-y-2">
                        {/* 1. Accept Incoming (if pending) */}
                        <Button
                            onClick={handleAcceptHandover}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            <PackageCheck className="mr-2 h-4 w-4" />
                            {t('btn_accept_custody')}
                        </Button>

                        {/* 2. Dispatch (if owned) */}
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={handleDispatch} variant="outline" className="border-blue-600 text-blue-600">
                                <Truck className="mr-2 h-4 w-4" />
                                {t('btn_dispatch_truck')}
                            </Button>
                            <Button onClick={handleTransferToRetailer} variant="outline">
                                {t('btn_transfer_retailer')}
                            </Button>
                        </div>

                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handleReport}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            {t('btn_report')}
                        </Button>
                    </div>
                )}

                {/* Retailer Actions - Can Accept Transfer */}
                {role === 'RETAILER' && (
                    <div className="rounded-md bg-slate-50 p-4 border border-slate-200 space-y-3">
                        <h4 className="font-semibold text-sm">{t('retailer_checkpoint')}</h4>
                        <div className="flex flex-col gap-2">
                            {/* Only show Accept if transfer is pending (or allow it to try) */}
                            <Button onClick={handleAcceptHandover} className="w-full h-auto py-2 whitespace-normal bg-green-600 hover:bg-green-700 text-white flex flex-col sm:flex-row items-center justify-center gap-2">
                                <PackageCheck className="h-4 w-4 shrink-0" />
                                <span className="text-center">{t('btn_accept_handover')}</span>
                            </Button>
                            <Button variant="outline" onClick={handleReport} className="w-full h-auto py-2 whitespace-normal text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex flex-col sm:flex-row items-center justify-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span className="text-center">{t('report_issue_btn')}</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Manufacturer Actions - Initiate Transfer to Logistics */}
                {role === 'MANUFACTURER' && !blockchainStatus.pendingOwner && (
                    <div className="mt-2">
                        <Button onClick={handleTransferToLogistics} variant="outline" className="w-full">
                            <Truck className="mr-2 h-4 w-4" />
                            {t('btn_transfer_logistics')}
                        </Button>
                    </div>
                )}
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
                <Button onClick={handleNotarize} className="w-full bg-purple-600 hover:bg-purple-700">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {t('btn_notarize')}
                </Button>
            </div>
        );
    }

    return <div className="text-sm text-gray-500 italic">{t('bc_waiting_manufacturer')}</div>;
}
