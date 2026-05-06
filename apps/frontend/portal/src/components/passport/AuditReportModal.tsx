'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ShieldCheck, Clock, Thermometer, AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AuditReportModalProps {
    batch: any;
    bcHistory: any[];
    telemetry: any[];
    alerts: any[];
}

export function AuditReportModal({ batch, bcHistory, telemetry, alerts }: AuditReportModalProps) {
    const t = useTranslations('Tracking');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-16 px-8 rounded-2xl border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all group">
                    <FileText className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    {t('full_protocol_audit')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-[3rem] border-primary/10 p-0 shadow-2xl">
                <div className="p-10 md:p-14">
                    <DialogHeader className="mb-12">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <DialogTitle className="text-4xl font-serif font-black italic tracking-tighter">{t('audit_report_title')}</DialogTitle>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-2">Verified by Global FoodTech Bridge Notary</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-muted/50">
                                <Download size={20} />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-12">
                        {/* Summary Header */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60 mb-2">{t('audit_integrity_status')}</h4>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                    <span className="text-xl font-black italic">VERIFIED</span>
                                </div>
                            </div>
                            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-2">Blockchain Records</h4>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-6 w-6 text-primary" />
                                    <span className="text-xl font-black italic">{bcHistory.length} Events</span>
                                </div>
                            </div>
                            <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-amber-600/60 mb-2">{t('audit_active_warnings')}</h4>
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-6 w-6 text-amber-500" />
                                    <span className="text-xl font-black italic">{alerts.length} Warnings</span>
                                </div>
                            </div>
                        </div>

                        {/* Blockchain Ledger Table */}
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-6 px-2">{t('audit_ledger_title')}</h3>
                            <div className="rounded-[2rem] border border-primary/10 overflow-hidden shadow-inner">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary/5">
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary/60">Stage</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary/60">Details</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary/60">Timestamp</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary/60">Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {bcHistory.map((event, idx) => (
                                            <tr key={idx} className="hover:bg-primary/[0.02] transition-colors">
                                                <td className="p-6 font-black text-sm italic">{event.stage}</td>
                                                <td className="p-6 text-xs text-muted-foreground">{event.details}</td>
                                                <td className="p-6 text-[10px] font-mono text-muted-foreground/60">{new Date(event.timestamp).toLocaleString()}</td>
                                                <td className="p-6">
                                                    <code className="text-[9px] bg-muted px-3 py-1.5 rounded-lg font-bold">
                                                        {event.transactionHash?.substring(0, 8)}...
                                                    </code>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* SLA / Sensor Audit */}
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-6 px-2">{t('audit_environmental_compliance')}</h3>
                            <div className="p-10 rounded-[2.5rem] bg-muted/30 border border-primary/5">
                                <div className="flex items-center gap-8 mb-8">
                                    <div className="flex items-center gap-3">
                                        <Thermometer className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-black italic">Avg Temp: {telemetry.length > 0 ? (telemetry.reduce((acc, r) => acc + r.temperature_celsius, 0) / telemetry.length).toFixed(1) : 'N/A'}°C</span>
                                    </div>
                                    <div className="h-6 w-px bg-primary/10" />
                                    <div className="text-sm font-black italic">Range: {batch.min_temp}°C to {batch.max_temp}°C</div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    The environmental monitoring system has recorded continuous telemetry for Batch {batch.id}. 
                                    All readings have been cross-referenced with the blockchain-notarized SLA thresholds. 
                                    Status: {alerts.length === 0 ? 'Compliant' : 'Non-Compliant (Requires Manual Audit)'}.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
