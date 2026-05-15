import { getAdminBatches } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Globe, ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { Link } from '@/navigation';

import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
    const { locale } = params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    
    return {
        title: t('admin_operations_title'),
        description: t('admin_operations_description'),
    };
}

export default async function AdminOperationsPage({ params: { locale } }: { params: { locale: string } }) {
    unstable_setRequestLocale(locale);
    const t = await getTranslations('Admin');
    const batches = await getAdminBatches();

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <Link href="/admin/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                    <h1 className="text-4xl font-serif font-black italic tracking-tighter text-foreground uppercase">
                        {t('ledger_title')}
                    </h1>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                    {t('ledger_subtitle')}
                </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Link href="/batches/new">
                        <Button className="h-14 px-8 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all">
                            <Plus className="w-4 h-4 mr-3" />
                            {t('initialize_batch')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters / Search (UI only for now) */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Batch ID, Origin, or Manufacturer..." 
                        className="w-full h-14 pl-12 pr-6 rounded-2xl border-primary/5 glass text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 rounded-2xl border-primary/5 glass text-[10px] font-black uppercase tracking-widest">
                    <Filter className="mr-3" size={16} />
                    {t('advanced_filters')}
                </Button>
            </div>

            {/* Operations Table */}
            <Card className="rounded-[3rem] border-primary/5 glass overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-primary/5">
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Identity</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Product</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Route</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Status</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Created At</th>
                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {batches.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <Package className="w-12 h-12 text-primary/10 mx-auto mb-4" />
                                            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/30">{t('no_operational_data')}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    batches.map((batch) => (
                                        <tr key={batch.id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                                                        <Package size={20} />
                                                    </div>
                                                    <span className="text-sm font-serif font-black italic tracking-tight">#{batch.id.slice(0, 8).toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-primary/10">
                                                    {batch.product_type}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                    <Globe size={12} className="text-primary/30" />
                                                    {batch.origin_country} <span className="opacity-20">→</span> {batch.destination_country}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] font-mono text-muted-foreground/40 italic">
                                                {new Date(batch.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link href={`/batches/${batch.id}`}>
                                                    <Button variant="ghost" size="sm" className="rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                                        {t('btn_details')}
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
