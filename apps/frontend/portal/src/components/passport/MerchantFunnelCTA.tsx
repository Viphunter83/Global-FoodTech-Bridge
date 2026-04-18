import React from 'react';
import { ShoppingCart, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MerchantFunnelCTAProps {
    merchantName: string;
    redirectUrl?: string;
    productType?: string;
    className?: string;
}

export function MerchantFunnelCTA({ merchantName, redirectUrl, productType, className }: MerchantFunnelCTAProps) {
    if (!redirectUrl) return null;

    return (
        <Card className="overflow-hidden border-2 border-emerald-100 shadow-xl relative mt-8">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck className="h-32 w-32 text-emerald-600" />
            </div>

            <div className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Verified Access
                    </span>
                    <span className="text-emerald-900/40 text-xs">•</span>
                    <span className="text-emerald-900/60 text-xs font-medium">Authorized Retailer</span>
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold text-emerald-950 font-serif leading-tight">
                            Quality Guaranteed by <br/>
                            <span className="text-emerald-700">{merchantName}</span>
                        </h2>
                        <p className="text-emerald-800/70 text-sm mt-2 max-w-md">
                            This batch has been verified on-chain. Buy with confidence directly from the source or an authorized partner.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 flex-1 group"
                            onClick={() => window.open(redirectUrl, '_blank')}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span>Purchase Verified {productType || "Product"}</span>
                            <ArrowRight className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" />
                        </Button>
                        
                        <Button 
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-12 px-6 rounded-xl font-medium flex items-center justify-center gap-2"
                            onClick={() => window.open(redirectUrl, '_blank')}
                        >
                            <span>Visit Store</span>
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Proof Strip */}
            <div className="bg-emerald-50 px-6 py-3 flex items-center justify-between border-t border-emerald-100">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-800/50 uppercase font-bold tracking-widest">Trust Protocol</span>
                        <span className="text-xs font-bold text-emerald-900">GFTB Secure Link</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Tamper-Proof</span>
                </div>
            </div>
        </Card>
    );
}
