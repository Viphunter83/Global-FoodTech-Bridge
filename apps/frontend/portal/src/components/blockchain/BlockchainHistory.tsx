import React from 'react';
import { 
    CheckCircle2, 
    Truck, 
    Store, 
    AlertCircle, 
    Factory, 
    Activity,
    ExternalLink,
    ShieldCheck,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlockchainEvent } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface BlockchainHistoryProps {
    history: BlockchainEvent[];
}

const getEventIcon = (event: string) => {
    switch (event) {
        case 'BatchCreated': return <Factory className="h-5 w-5" />;
        case 'TransferInitiated': return <Activity className="h-5 w-5" />;
        case 'TransferCompleted': return <Truck className="h-5 w-5" />;
        case 'ViolationReported': return <AlertCircle className="h-5 w-5" />;
        default: return <CheckCircle2 className="h-5 w-5" />;
    }
};

const getEventColor = (event: string) => {
    switch (event) {
        case 'BatchCreated': return 'bg-green-100 text-green-600 border-green-200';
        case 'TransferInitiated': return 'bg-blue-100 text-blue-600 border-blue-200';
        case 'TransferCompleted': return 'bg-purple-100 text-purple-600 border-purple-200';
        case 'ViolationReported': return 'bg-red-100 text-red-600 border-red-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

export function BlockchainHistory({ history }: BlockchainHistoryProps) {
    const t = useTranslations('Tracking');
    
    if (!history || history.length === 0) {
        return (
            <Card className="border-dashed bg-gray-50/50 border-gray-200 animate-pulse">
                <CardContent className="p-10 text-center space-y-4">
                    <div className="relative inline-block">
                        <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto" />
                        <Activity className="h-4 w-4 text-blue-400 absolute -bottom-1 -right-1 animate-ping" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{t('pending_consensus')}</p>
                        <p className="text-[10px] text-gray-400 font-mono italic">SYNC_GATEWAY: VERIFYING_BLOCKS_AMOY</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-2xl border-0 bg-white overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-gradient-to-br from-gray-50/80 to-white border-b border-gray-100 p-8">
                <CardTitle className="text-lg font-serif font-black flex items-center justify-between italic tracking-tight uppercase">
                    <span className="flex items-center gap-3 text-gray-900">
                        <div className="bg-green-500 p-2 rounded-xl shadow-lg shadow-green-200">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        {t('bc_validation_title')}
                    </span>
                    <span className="text-[10px] bg-green-500 text-white px-4 py-1.5 rounded-full font-sans not-italic tracking-widest font-black shadow-md shadow-green-100">
                        {t('success').toUpperCase()}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="relative pl-10 space-y-10">
                    {/* Connecting Line */}
                    <div className="absolute left-[47px] top-4 bottom-10 w-0.5 bg-gradient-to-b from-green-500/20 via-blue-400/20 to-transparent border-l border-dashed border-gray-200"></div>

                    {history.map((item, idx) => (
                        <div key={idx} className="relative group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            {/* Icon Circle */}
                            <div className={`absolute -left-[45px] top-0 p-3 rounded-2xl border-2 bg-white shadow-xl z-10 transition-all group-hover:scale-110 group-hover:-rotate-3 ${getEventColor(item.event)}`}>
                                {getEventIcon(item.event)}
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <h4 className={`text-sm font-black uppercase tracking-widest ${item.event === 'ViolationReported' ? 'text-destructive' : 'text-gray-900'}`}>
                                        {String(item.stage)}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono font-bold bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                        <Clock className="h-3 w-3" />
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                </div>
                                
                                <p className="text-xs text-muted-foreground font-bold leading-relaxed italic bg-blue-50/30 p-3 rounded-2xl border border-blue-100/50">
                                    {typeof item.details === 'string' ? item.details : JSON.stringify(item.details)}
                                </p>

                                <div className="pt-2 flex flex-wrap gap-3 items-center">
                                    <div className="bg-gray-900 px-3 py-1.5 rounded-xl text-[9px] text-white flex items-center gap-2 shadow-lg shadow-gray-200">
                                        <span className="font-black text-gray-400 uppercase tracking-tighter">NODE:</span> 
                                        <span className="font-mono">{item.actor}</span>
                                    </div>
                                    <a 
                                        href={`https://amoy.polygonscan.com/tx/${item.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] font-black text-blue-600 hover:text-blue-800 underline-offset-4 decoration-wavy flex items-center gap-1.5 transition-all hover:gap-2 group/link"
                                    >
                                        BLOCK #{item.blockNumber} 
                                        <ExternalLink className="h-3 w-3 group-hover/link:rotate-12 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-gray-950 p-6 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-green-500/20 transition-colors"></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="bg-green-500/20 p-2 rounded-xl border border-green-500/30">
                            <ShieldCheck className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] text-white font-black uppercase tracking-widest">{t('full_protocol_audit')}</p>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-bold italic">
                                {t('logistics_flow_integrity')}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

