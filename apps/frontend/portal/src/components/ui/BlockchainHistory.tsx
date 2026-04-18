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
    if (!history || history.length === 0) {
        return (
            <Card className="border-dashed bg-gray-50/50">
                <CardContent className="p-8 text-center space-y-2">
                    <ShieldCheck className="h-10 w-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500 font-medium">History records are being synchronized...</p>
                    <p className="text-[10px] text-gray-400">Verifying blocks on Polygon Amoy Network</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md border-0 bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-800">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        Blockchain-Verified Journey
                    </span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-tight">
                        Audit-Ready
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="relative pl-8 space-y-8">
                    {/* Connecting Line */}
                    <div className="absolute left-[39px] top-2 bottom-8 w-0.5 bg-gradient-to-b from-green-200 via-blue-100 to-gray-100"></div>

                    {history.map((item, idx) => (
                        <div key={idx} className="relative group">
                            {/* Icon Circle */}
                            <div className={`absolute -left-[35px] top-0 p-2 rounded-full border-2 bg-white shadow-sm z-10 transition-transform group-hover:scale-110 ${getEventColor(item.event)}`}>
                                {getEventIcon(item.event)}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className={`text-sm font-bold uppercase tracking-tight ${item.event === 'ViolationReported' ? 'text-red-700' : 'text-gray-900'}`}>
                                        {item.stage}
                                    </h4>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                                        <Clock className="h-3 w-3" />
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                
                                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                    {item.details}
                                </p>

                                <div className="pt-2 flex flex-wrap gap-2 items-center">
                                    <div className="bg-gray-50 border border-gray-100 px-2 py-1 rounded text-[10px] text-gray-500 flex items-center gap-1">
                                        <span className="font-bold">Actor:</span> {item.actor}
                                    </div>
                                    <a 
                                        href={`https://amoy.polygonscan.com/tx/${item.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-blue-500 hover:text-blue-700 underline flex items-center gap-0.5 transition-colors"
                                    >
                                        Block #{item.blockNumber} <ExternalLink className="h-2 w-2" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-blue-50/50 p-3 rounded-md border border-blue-100 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-[10px] text-blue-700 leading-normal">
                        <strong>Public Proof:</strong> Every step shown above is cryptographically linked to the previous one, 
                        making the history impossible to modify without detection. This provides full transparency 
                        for consumers and immutable evidence for insurance claims.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
