'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Database, 
    Shield, 
    Zap, 
    Activity, 
    Cpu, 
    Link as LinkIcon, 
    ExternalLink,
    Wallet,
    Globe,
    RefreshCcw,
    History
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface WalletStatus {
    name: string;
    address: string;
    balance: string;
}

interface BlockchainAdminStatus {
    mode: 'MOCK' | 'LIVE';
    network: string;
    contract: string;
    wallets: WalletStatus[];
}

interface BlockchainMonitorProps {
    status: BlockchainAdminStatus;
}

export function BlockchainMonitor({ status }: BlockchainMonitorProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                            <Database size={24} />
                        </div>
                        <h1 className="text-4xl font-serif font-black italic tracking-tighter text-foreground uppercase">
                            Smart Contracts
                        </h1>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                        Transparency Ledger & Custodial Wallet Infrastructure
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Badge className={`h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest ${status.mode === 'LIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        {status.mode} PROTOCOL ACTIVE
                    </Badge>
                    <Button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        variant="outline" 
                        className="h-12 w-12 rounded-2xl border-primary/10 flex items-center justify-center p-0 transition-all active:scale-90"
                    >
                        <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            {/* Network Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Node Card */}
                <Card className="lg:col-span-2 rounded-[3rem] border-primary/5 glass overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <Globe size={240} />
                    </div>
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-xl font-serif font-black italic tracking-tight flex items-center gap-3 text-primary">
                            <LinkIcon size={20} />
                            Contract Registry
                        </CardTitle>
                        <CardDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                            Deployed on {status.network}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-6 space-y-8">
                        <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-primary/20 to-transparent" />
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 mb-3">Polygon Registry Address</p>
                            <div className="flex items-center justify-between gap-4">
                                <code className="text-sm md:text-lg font-mono font-bold tracking-tighter text-blue-400 truncate">
                                    {status.contract}
                                </code>
                                <Button size="icon" variant="ghost" className="shrink-0 text-white/40 hover:text-white hover:bg-white/10 rounded-xl">
                                    <ExternalLink size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Gas Limit', value: '3,000,000', icon: Zap },
                                { label: 'Latency', value: '1.2s', icon: Activity },
                                { label: 'TX Success', value: '99.9%', icon: Shield },
                                { label: 'Node Region', value: 'Global', icon: Globe },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl border border-primary/5 bg-white/40 flex flex-col items-center justify-center text-center">
                                    <item.icon size={16} className="text-primary/40 mb-2" />
                                    <p className="text-xs font-black tracking-tight">{item.value}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Health Summary */}
                <Card className="rounded-[3rem] bg-slate-900 text-white border-0 p-10 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Protocol Health</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Notarization Stream</span>
                                <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[8px]">ACTIVE</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">SLA Violation Oracle</span>
                                <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[8px]">ACTIVE</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Transfer Relayer</span>
                                <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[8px]">ACTIVE</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">Block Propagation</p>
                            <div className="flex gap-1">
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                                    <motion.div 
                                        key={i}
                                        animate={{ height: [8, 16, 8] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                        className="w-1 bg-primary/40 rounded-full" 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Custodial Wallets Area */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-serif font-black italic tracking-tight flex items-center gap-3">
                        <Wallet className="text-primary" size={20} />
                        Custodial Operational Wallets
                    </h2>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                        Managed Wallets for Automated Cross-Border Execution
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {status.wallets.map((wallet, idx) => (
                        <motion.div
                            key={wallet.address}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                        >
                            <Card className="rounded-[2.5rem] border-primary/5 glass hover:shadow-2xl transition-all group overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Shield size={20} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 mb-1">Status</p>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-500">OPERATIONAL</Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
                                                {wallet.name}
                                            </h3>
                                            <p className="text-[10px] font-mono font-medium text-muted-foreground/40 mt-1 truncate">
                                                {wallet.address}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-primary/5 flex items-end justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Available Fuel (Gas)</p>
                                                <p className="text-2xl font-serif font-black italic tracking-tighter text-foreground">
                                                    {wallet.balance}
                                                </p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/5 hover:text-primary mb-1">
                                                <History size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
