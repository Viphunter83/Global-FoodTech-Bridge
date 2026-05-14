'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DEMO_MANUFACTURER_ID } from '@/lib/constants';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import { getTemplates, SupplyChainTemplate, uploadToIpfs, createBatch } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { 
    AlertTriangle, 
    Layers, 
    PackagePlus, 
    CheckCircle, 
    Loader2, 
    Calendar as CalendarIcon, 
    Upload, 
    FileText, 
    MapPin,
    RefreshCw,
    X,
    FileCheck,
    ChevronRight,
    QrCode,
    Globe,
    Zap
} from 'lucide-react'; 
import { Link } from '@/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay';
import { toast } from 'sonner';

export default function CreateBatchPage() {
    const { role, companyId } = useAuth();
    const t = useTranslations('Batch');
    const tCommon = useTranslations('Common');
    const [isLoading, setIsLoading] = useState(false);
    const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
    const [recentBatches, setRecentBatches] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [templates, setTemplates] = useState<SupplyChainTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(true);
    const [templatesError, setTemplatesError] = useState<string | null>(null);
    const [requiredCerts, setRequiredCerts] = useState<string[]>([]);
    const [uploadedCerts, setUploadedCerts] = useState<Record<string, File>>({});
    const [productionDate, setProductionDate] = useState<Date>(new Date());
    const [expirationDate, setExpirationDate] = useState<Date>();
    const [productType, setProductType] = useState<string>('PHO_BO_SOUP');
    const [unitOfMeasure, setUnitOfMeasure] = useState<string>('kg');

    const loadTemplates = useCallback(async () => {
        setIsTemplatesLoading(true);
        setTemplatesError(null);
        try {
            const data = await getTemplates();
            setTemplates(data);
            if (data.length > 0) {
                const firstTpl = data[0];
                setSelectedTemplateId(firstTpl.id);
                const certs = firstTpl.steps?.map(s => s.required_cert).filter(Boolean) as string[] || [];
                setRequiredCerts(Array.from(new Set(certs)));
            }
        } catch (err) {
            console.error("Failed to load templates:", err);
            setTemplatesError(t('compliance_empty_templates'));
        } finally {
            setIsTemplatesLoading(false);
        }
    }, [t]);

    useEffect(() => {
        const history = localStorage.getItem('recent_batches');
        if (history) setRecentBatches(JSON.parse(history));
        loadTemplates();
    }, [loadTemplates]);

    useEffect(() => {
        const selected = templates.find(t => t.id === selectedTemplateId);
        if (selected) {
            const certs = selected.steps?.map(s => s.required_cert).filter(Boolean) as string[] || [];
            setRequiredCerts(Array.from(new Set(certs)));
            setUploadedCerts({});
        }
    }, [selectedTemplateId, templates]);

    const saveToHistory = (id: string) => {
        const newHistory = [id, ...recentBatches].slice(0, 5);
        setRecentBatches(newHistory);
        localStorage.setItem('recent_batches', JSON.stringify(newHistory));
    };

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (role !== 'MANUFACTURER' && role !== 'ADMIN') {
            console.warn(`[GFTB-BATCH] Access denied: Role is ${role}. ONLY MANUFACTURER or ADMIN can create batches.`);
            setError(t('error_insufficient_permissions') || 'Only MANUFACTURER role can create batches.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setCreatedBatchId(null);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const manufacturer_id = formData.get('manufacturer_id') as string;
        const product_type = formData.get('product_type') as string;
        const batch_size = Number(formData.get('batch_size'));

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                throw new Error("Session expired. Please re-login.");
            }

            console.log(`[GFTB-BATCH] Initiating upload to IPFS with token presence: ${!!token}`);

            const uploadPayload = new FormData();
            uploadPayload.append('manufacturer_id', manufacturer_id);
            uploadPayload.append('product_type', product_type);
            uploadPayload.append('batch_size', batch_size.toString());
            uploadPayload.append('unit_of_measure', formData.get('unit_of_measure') as string);
            uploadPayload.append('origin_country', formData.get('origin_country') as string || 'Unknown');
            uploadPayload.append('destination_country', formData.get('destination_country') as string || 'Unknown');
            uploadPayload.append('ingredients', formData.get('ingredients') as string || '');
            if (productionDate) uploadPayload.append('productionDate', productionDate.toISOString());
            if (expirationDate) uploadPayload.append('expirationDate', expirationDate.toISOString());
            uploadPayload.append('productionLocation', formData.get('production_location') as string || '');
            uploadPayload.append('originLocation', formData.get('origin_location') as string || '');
            
            const marketingStory = formData.get('marketing_story') as string;
            if (marketingStory) {
                uploadPayload.append('marketingStory', marketingStory);
            }
            const redirectUrl = formData.get('partner_redirect_url') as string;
            if (redirectUrl) {
                uploadPayload.append('partnerRedirectUrl', redirectUrl);
            }

            const certMapping: Record<string, string> = {};
            Object.entries(uploadedCerts).forEach(([type, file]) => {
                uploadPayload.append('files', file);
                certMapping[file.name] = type;
            });
            uploadPayload.append('cert_mapping', JSON.stringify(certMapping));

            // 1. Upload to IPFS via blockchain-service (proxied)
            const uploadJson = await uploadToIpfs(uploadPayload, token);
            const tokenUri = uploadJson.ipfsHash;
            console.log(`[GFTB-BATCH] IPFS Metadata Created: ${tokenUri}`);

            // 2. Register Batch in Passport Service (proxied)
            const batchData = {
                manufacturer_id,
                product_type,
                batch_size,
                unit_of_measure: formData.get('unit_of_measure') as string,
                origin_country: formData.get('origin_country') as string || 'Unknown',
                destination_country: formData.get('destination_country') as string || 'Unknown',
                template_id: selectedTemplateId,
                token_uri: tokenUri,
                marketing_story: {
                    en: formData.get('marketing_story') as string || ''
                },
                partner_redirect_url: formData.get('partner_redirect_url') as string || '',
            };

            const registration = await createBatch(batchData, token, role || 'MANUFACTURER');
            console.log(`[GFTB-BATCH] Batch successfully registered: ${registration.batch_id}`);
            
            toast.success('Digital Passport Created', {
                description: `Batch ID: ${registration.batch_id.substring(0, 16)}...`
            });
            setCreatedBatchId(registration.batch_id);
            saveToHistory(registration.batch_id);
        } catch (err: any) {
            console.error("[GFTB-BATCH] Submission failed:", err);
            setError(err.message || 'Failed to create batch');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background p-6 lg:p-12 relative overflow-hidden">
            {/* Premium Ambient Visuals */}
            <div className="absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-[100px]" />

            <div className="mx-auto max-w-5xl relative z-10">
                <div className="mb-16 flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary shadow-2xl shadow-primary/40 text-white relative group cursor-default"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-[2.5rem]" />
                        <PackagePlus size={44} className="relative z-10" />
                    </motion.div>
                    <div className="text-center space-y-3">
                        <h1 className="text-5xl md:text-6xl font-serif font-black italic tracking-tighter text-foreground leading-[0.9]">
                            {t('create_batch_title')}
                        </h1>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-1 w-1 rounded-full bg-primary/40" />
                            <p className="max-w-md text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/80 leading-relaxed italic">
                                {t('create_batch_subtitle')}
                            </p>
                            <div className="h-1 w-1 rounded-full bg-primary/40" />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {createdBatchId ? (
                        <motion.div
                            key="success"
                            initial={{ y: 30, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -30, opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden rounded-[3rem] glass border-primary/10 p-12 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]"
                        >
                            <div className="flex flex-col items-center text-center">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    className="mb-10 rounded-full bg-emerald-500/10 p-8 text-emerald-500 shadow-inner"
                                >
                                    <CheckCircle size={80} strokeWidth={1.5} />
                                </motion.div>
                                <h2 className="text-4xl font-serif font-black italic tracking-tighter text-foreground">{t('msg_batch_created')}</h2>
                                <div className="mt-6 flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">{tCommon('batch_id')}</span>
                                    <p className="font-mono text-xs font-black text-primary px-8 py-3 bg-primary/[0.03] rounded-2xl border border-primary/10 shadow-inner leading-none uppercase tracking-widest">{createdBatchId}</p>
                                </div>

                                <div className="my-14 p-12 bg-white rounded-[3rem] shadow-2xl shadow-primary/5 border border-primary/5 group relative">
                                    <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]" />
                                    <div className="relative z-10">
                                        <QRCodeDisplay value={`${window.location.origin}/batches/${createdBatchId}`} size={240} />
                                        <div className="mt-8 flex items-center justify-center gap-4 text-primary animate-pulse">
                                            <QrCode size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{tCommon('scan_share')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                    <Link href={`/batches/${createdBatchId}`} className="w-full">
                                        <Button className="w-full h-auto min-h-[5rem] py-4 px-6 bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 rounded-3xl text-sm font-black uppercase tracking-[0.1em] transition-all active:scale-[0.98] whitespace-normal leading-tight">
                                            {t('msg_track_status')} <ChevronRight className="ml-3 h-5 w-5 shrink-0" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full h-auto min-h-[5rem] py-4 px-6 glass border-primary/10 hover:bg-primary/5 rounded-3xl text-sm font-black uppercase tracking-[0.1em] transition-all active:scale-[0.98] whitespace-normal leading-tight"
                                        onClick={() => setCreatedBatchId(null)}
                                    >
                                        {t('msg_create_another')}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="grid gap-12 lg:grid-cols-5"
                        >
                            {/* Main Form Interface */}
                            <Card className="lg:col-span-3 rounded-[3rem] border border-primary/10 glass p-10 md:p-14 shadow-2xl shadow-primary/5">
                                <form onSubmit={onSubmit} className="space-y-10">
                                    <div className="grid gap-8 sm:grid-cols-2 items-start">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 min-h-[2.5rem] flex items-end pb-1.5">{t('form_manufacturer_id')}</Label>
                                            <Input
                                                id="manufacturer_id"
                                                name="manufacturer_id"
                                                defaultValue={companyId || DEMO_MANUFACTURER_ID}
                                                className="h-14 rounded-2xl bg-muted/10 border-primary/5 focus:bg-background focus:border-primary/20 transition-all text-sm font-bold tracking-tight"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 min-h-[2.5rem] flex items-end pb-1.5">{t('form_product_type')}</Label>
                                            <Select value={productType} onValueChange={setProductType}>
                                                <SelectTrigger className="h-14 rounded-2xl bg-muted/10 border-primary/5 focus:bg-background focus:border-primary/20 transition-all text-sm font-bold tracking-tight">
                                                    <SelectValue placeholder={t('form_product_type')} />
                                                </SelectTrigger>
                                                <SelectContent className="glass border-primary/10 rounded-2xl">
                                                    <SelectItem value="PHO_BO_SOUP">{t('product_pho_bo')}</SelectItem>
                                                    <SelectItem value="MANGO_SHAKE">{t('product_mango_shake')}</SelectItem>
                                                    <SelectItem value="DRIED_MANGO">{t('product_dried_mango')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" name="product_type" value={productType} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-1 flex items-center gap-3">
                                            <Zap size={14} className="animate-pulse" /> {t('form_select_template')}
                                        </Label>
                                        {isTemplatesLoading ? (
                                            <div className="flex h-14 items-center gap-3 px-5 border border-primary/5 rounded-2xl bg-muted/5 animate-pulse">
                                                <Loader2 size={16} className="animate-spin text-primary/40" />
                                                <div className="h-4 w-1/2 bg-primary/5 rounded" />
                                            </div>
                                        ) : (
                                            <>
                                                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                                    <SelectTrigger className="h-14 rounded-2xl bg-muted/10 border-primary/5 focus:bg-background focus:border-primary/20 transition-all text-sm font-bold tracking-tight">
                                                        <SelectValue placeholder={t('form_select_template')} />
                                                    </SelectTrigger>
                                                    <SelectContent className="glass border-primary/10 rounded-2xl">
                                                        {templates.map((tpl) => (
                                                            <SelectItem key={tpl.id} value={tpl.id}>{tpl.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <input type="hidden" name="template_id" value={selectedTemplateId} />
                                            </>
                                        )}
                                    </div>

                                    <div className="grid gap-8 sm:grid-cols-2 items-start">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 min-h-[2.5rem] flex items-end pb-1.5">
                                                <MapPin size={12} className="mr-1.5 text-primary/40" />{t('form_origin_country')}
                                            </Label>
                                            <Input id="origin_country" name="origin_country" placeholder="Vietnam" className="h-14 rounded-2xl bg-muted/10 border-primary/5 focus:bg-background focus:border-primary/20 transition-all text-sm font-bold tracking-tight" required />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 min-h-[2.5rem] flex items-end pb-1.5">
                                                <Globe size={12} className="mr-1.5 text-primary/40" />{t('form_destination_country')}
                                            </Label>
                                            <Input id="destination_country" name="destination_country" placeholder="UAE" className="h-14 rounded-2xl bg-muted/10 border-primary/5 focus:bg-background focus:border-primary/20 transition-all text-sm font-bold tracking-tight" required />
                                        </div>
                                    </div>

                                    <div className="grid gap-8 sm:grid-cols-2 items-start">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 min-h-[2.5rem] flex items-end pb-1.5">{t('form_batch_size')}</Label>
                                            <Input id="batch_size" name="batch_size" type="number" placeholder="100" className="h-14 rounded-2xl bg-muted/10 border-primary/5 font-bold" required />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 min-h-[2.5rem] flex items-end pb-1.5">{t('form_unit_of_measure')}</Label>
                                            <Select value={unitOfMeasure} onValueChange={setUnitOfMeasure}>
                                                <SelectTrigger className="h-14 rounded-2xl bg-muted/10 border-primary/5 focus:bg-background focus:border-primary/20 transition-all text-sm font-bold tracking-tight">
                                                    <SelectValue placeholder={t('form_unit_of_measure')} />
                                                </SelectTrigger>
                                                <SelectContent className="glass border-primary/10 rounded-2xl">
                                                    <SelectItem value="kg">{t('unit_kg')}</SelectItem>
                                                    <SelectItem value="lbs">{t('unit_lbs')}</SelectItem>
                                                    <SelectItem value="units">{t('unit_units')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" name="unit_of_measure" value={unitOfMeasure} />
                                        </div>
                                    </div>

                                    {/* Advanced Metadata Integration */}
                                    <div className="space-y-8 pt-10 border-t border-primary/5">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{t('form_ingredients')}</Label>
                                            <Textarea id="ingredients" name="ingredients" className="min-h-[120px] rounded-[1.5rem] bg-muted/10 border-primary/5 p-6 font-medium italic focus:bg-background transition-all resize-none shadow-inner" />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Marketing Story (English)</Label>
                                            <Textarea id="marketing_story" name="marketing_story" placeholder="Directly from the sun-drenched orchards of the Mekong Delta..." className="min-h-[120px] rounded-[1.5rem] bg-muted/10 border-primary/5 p-6 font-medium italic focus:bg-background transition-all resize-none shadow-inner" />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Product Redirect Link / Online Store</Label>
                                            <Input id="partner_redirect_url" name="partner_redirect_url" placeholder="https://mangovietnam.demo/order-us" className="h-14 rounded-2xl bg-muted/10 border-primary/5 focus:bg-background focus:border-primary/20 transition-all text-sm font-bold tracking-tight" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{t('form_production_date')}</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full h-14 justify-start rounded-2xl bg-muted/10 border-primary/5 text-sm font-bold hover:bg-background hover:border-primary/20 transition-all">
                                                            <CalendarIcon className="mr-3 h-5 w-5 text-primary/40" />
                                                            {productionDate ? format(productionDate, "PPP") : <span>{t('pick_date')}</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="p-0 rounded-[2rem] border-primary/10 shadow-2xl glass overflow-hidden" align="start">
                                                        <Calendar mode="single" selected={productionDate} onSelect={(d) => d && setProductionDate(d)} initialFocus className="p-4" />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{t('form_expiration_date')}</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full h-14 justify-start rounded-2xl bg-muted/10 border-primary/5 text-sm font-bold hover:bg-background hover:border-primary/20 transition-all">
                                                            <CalendarIcon className="mr-3 h-5 w-5 text-primary/40" />
                                                            {expirationDate ? format(expirationDate, "PPP") : <span>{t('pick_date')}</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="p-0 rounded-[2rem] border-primary/10 shadow-2xl glass overflow-hidden" align="start">
                                                        <Calendar mode="single" selected={expirationDate} onSelect={setExpirationDate} initialFocus className="p-4" />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-5 bg-destructive/5 text-destructive rounded-2xl border border-destructive/10 text-[10px] font-black uppercase tracking-widest italic flex gap-4 leading-relaxed">
                                            <AlertTriangle size={18} className="shrink-0" /> {error}
                                        </motion.div>
                                    )}

                                    <Button 
                                        className="w-full h-auto min-h-[5rem] py-4 px-8 bg-foreground hover:bg-black text-background rounded-[1.5rem] text-sm font-black uppercase tracking-[0.15em] shadow-2xl shadow-foreground/20 transition-all hover:scale-[1.01] active:scale-[0.98] mt-10 whitespace-normal leading-tight"
                                        disabled={isLoading} 
                                        type="submit"
                                    >
                                        {isLoading ? <Loader2 className="mr-3 animate-spin h-6 w-6" /> : <PackagePlus className="mr-3 shrink-0" size={24} />}
                                        <span className="flex-1">{t('create_batch_title')}</span>
                                    </Button>
                                </form>
                            </Card>

                            {/* Operational Sidebar */}
                            <div className="lg:col-span-2 space-y-10">
                                {/* Compliance Protocol Card */}
                                <Card className="rounded-[2.5rem] border border-primary/10 glass p-8 shadow-2xl shadow-primary/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-3000">
                                        <FileCheck size={180} />
                                    </div>
                                    <h3 className="text-sm font-serif font-black italic text-foreground mb-8 flex items-center gap-4 relative z-10">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                            <FileCheck size={20} />
                                        </div>
                                        {t('compliance_required_docs')}
                                    </h3>
                                    
                                    <div className="space-y-4 relative z-10">
                                        {requiredCerts.length > 0 ? (
                                            requiredCerts.map((cert) => (
                                                <div key={cert} className={cn(
                                                    "p-6 rounded-[1.5rem] border transition-all duration-500",
                                                    uploadedCerts[cert] 
                                                        ? "bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5 scale-[1.02]" 
                                                        : "bg-background/40 border-primary/5 hover:border-primary/10"
                                                )}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 italic">{cert.replace(/_/g, ' ')}</span>
                                                        {uploadedCerts[cert] ? (
                                                            <div className="h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                                <CheckCircle size={14} />
                                                            </div>
                                                        ) : (
                                                            <div className="h-6 w-6 rounded-lg border-2 border-primary/10 animate-pulse" />
                                                        )}
                                                    </div>
                                                    {uploadedCerts[cert] ? (
                                                        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-500/10 shadow-sm animate-in zoom-in duration-500">
                                                            <div className="flex items-center gap-3 truncate">
                                                                <FileText size={14} className="text-emerald-500 shrink-0" />
                                                                <span className="text-[10px] font-mono font-black text-emerald-600 truncate">{uploadedCerts[cert].name}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    const n = {...uploadedCerts}; delete n[cert]; setUploadedCerts(n);
                                                                }} 
                                                                className="p-1.5 hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive rounded-lg transition-colors"
                                                            >
                                                                <X size={14}/>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => {
                                                                const f = e.target.files?.[0]; if(f) setUploadedCerts(p => ({...p, [cert]: f}));
                                                            }} />
                                                            <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-primary/5 text-primary border border-primary/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300">
                                                                <Upload size={16} /> {t('btn_upload_file')}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-16 text-center rounded-[2rem] border border-dashed border-primary/20 glass flex flex-col items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/30">
                                                    <FileText size={24} />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic max-w-[180px] mx-auto leading-relaxed">{t('compliance_optional_docs')}</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Recent Activity Log */}
                                {recentBatches.length > 0 && (
                                    <Card className="rounded-[2.5rem] border border-primary/10 glass p-8 shadow-2xl shadow-primary/5 overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12">
                                            <RefreshCw size={100} />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-6 relative z-10">{t('recent_batches_title')}</h3>
                                        <div className="space-y-3 relative z-10">
                                            {recentBatches.map((id) => (
                                                <Link key={id} href={`/batches/${id}`} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-primary/[0.03] border border-transparent hover:border-primary/5 transition-all duration-300 shadow-sm hover:shadow-lg">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[8px] font-black uppercase tracking-tighter text-primary/40">PASSPORT ID</span>
                                                        <span className="font-mono text-[11px] font-black text-foreground/70 group-hover:text-primary leading-none uppercase">{id.slice(0, 16)}...</span>
                                                    </div>
                                                    <div className="h-8 w-8 rounded-xl bg-muted/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                                                        <ChevronRight size={14} />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

