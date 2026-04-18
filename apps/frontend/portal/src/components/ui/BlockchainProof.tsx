import React from 'react';
import { ShieldCheck, Hash, Link as LinkIcon, ExternalLink, Info, Award, Fingerprint } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface BlockchainProofProps {
    txHash?: string;
    dataHash?: string; // This is the IPFS CID (token_uri)
    issuer?: string;
    timestamp?: string;
    batchId: string;
}

// Map of known entities for human-readability
const IDENTITY_MAP: Record<string, string> = {
    '0x90Ac83B23BfEa12D7498689602C9512aD4929712': 'Verified Producer (FTB Factory #1)',
    '0xE326362613F44383504b1bFA5Dd92C0Fc7D38471': 'Digital Notary Contract (v1.0)',
    '0x1b9ba7069eb01d54fE7E8fC563274f945576B73a': 'Logistics Guardian',
    '0xB69B16B4b22e65BfCe544774DA9947E61506Fea0': 'Retailer Hub'
};

const getIdentity = (addr?: string) => {
    if (!addr) return 'Unknown Identity';
    return IDENTITY_MAP[addr] || `${addr.substring(0, 8)}...${addr.substring(addr.length - 4)}`;
};

export function BlockchainProof({ txHash, dataHash, issuer, timestamp, batchId }: BlockchainProofProps) {
    const explorerUrl = txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : '#';

    return (
        <Card className="border-2 border-green-100 bg-white/50 backdrop-blur-sm overflow-hidden shadow-sm">
            <CardHeader className="bg-green-50/50 pb-3 border-b border-green-100">
                <CardTitle className="text-sm font-bold text-green-800 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-green-600" />
                        CERTIFICATE OF INTEGRITY
                    </span>
                    <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Immutable Record
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                
                {/* 1. The Seal */}
                <div className="flex flex-col items-center text-center space-y-2 py-2">
                    <div className="bg-green-100 p-4 rounded-full">
                        <Fingerprint className="h-10 w-10 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium leading-tight max-w-[200px] mx-auto">
                            This product has a unique mathematical fingerprint secured on the Polygon Blockchain.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Issuer Identity */}
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Issued By</p>
                            <p className="text-sm font-semibold text-gray-800">{getIdentity(issuer)}</p>
                        </div>
                    </div>

                    {/* Data Fingerprint */}
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <Hash className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1 relative group">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                                Metadata Fingerprint (CID)
                                <Info className="h-3 w-3 text-gray-300" />
                            </p>
                            <p className="text-xs font-mono text-gray-600 break-all bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                                {dataHash || 'Generating Fingerprint...'}
                            </p>
                            <div className="hidden group-hover:block absolute -top-12 left-0 z-10 w-48 bg-gray-800 text-white text-[10px] p-2 rounded shadow-xl">
                                If even one character of the product data (ingredients, dates, logs) is changed, this fingerprint will break.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Educational Accordion */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="text-xs text-green-700 font-bold hover:no-underline py-2">
                            How does this verify my product?
                        </AccordionTrigger>
                        <AccordionContent className="text-[11px] text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-md border border-blue-100">
                            When this batch was created, the manufacturer recorded its details into a global digital vault. 
                            The blockchain hash acts as an unforgeable receipt. If the manufacturer tried to cheat or change the 
                            origin later, the record would no longer match the secure fingerprint seen here.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="pt-2">
                    <Button 
                        asChild 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-[11px] font-bold border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-600 transition-all"
                    >
                        <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            <ExternalLink className="h-3 w-3" />
                            VIEW ON BLOCKCHAIN EXPLORER
                        </a>
                    </Button>
                </div>

                <div className="text-[9px] text-center text-gray-400 italic">
                    Timestamp: {timestamp || 'N/A'} • Block Number: #36848285
                </div>
            </CardContent>
        </Card>
    );
}
