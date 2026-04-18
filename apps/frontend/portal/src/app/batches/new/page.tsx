'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { DEMO_MANUFACTURER_ID } from '@/lib/constants';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getTemplates, SupplyChainTemplate } from '@/lib/api';
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
    FileCheck
} from 'lucide-react'; 
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';

export default function CreateBatchPage() {
    const { role, companyId } = useAuth(); // Get current role and companyId
    const { t, dir } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
    const [recentBatches, setRecentBatches] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [templates, setTemplates] = useState<SupplyChainTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    // New states for error handling and dynamic compliance
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(true);
    const [templatesError, setTemplatesError] = useState<string | null>(null);
    const [requiredCerts, setRequiredCerts] = useState<string[]>([]);
    const [uploadedCerts, setUploadedCerts] = useState<Record<string, File>>({});

    const [productionDate, setProductionDate] = useState<Date>();
    const [expirationDate, setExpirationDate] = useState<Date>();
    const loadTemplates = async () => {
        setIsTemplatesLoading(true);
        setTemplatesError(null);
        try {
            const data = await getTemplates();
            setTemplates(data);
            if (data.length > 0) {
                const firstTpl = data[0];
                setSelectedTemplateId(firstTpl.id);
                // Extract required certs from first template
                const certs = firstTpl.steps?.map(s => s.required_cert).filter(Boolean) as string[] || [];
                setRequiredCerts(Array.from(new Set(certs)));
            }
        } catch (err) {
            console.error("Failed to load templates:", err);
            setTemplatesError(t('compliance_empty_templates'));
        } finally {
            setIsTemplatesLoading(false);
        }
    };

    useEffect(() => {
        const history = localStorage.getItem('recent_batches');
        if (history) {
            setRecentBatches(JSON.parse(history));
        }
        loadTemplates();
    }, []);

    // Effect to update required certs when template changes
    useEffect(() => {
        const selected = templates.find(t => t.id === selectedTemplateId);
        if (selected) {
            const certs = selected.steps?.map(s => s.required_cert).filter(Boolean) as string[] || [];
            setRequiredCerts(Array.from(new Set(certs)));
            // Clear uploaded certs that are no longer needed
            setUploadedCerts({});
        }
    }, [selectedTemplateId, templates]);

    const saveToHistory = (id: string) => {
        const newHistory = [id, ...recentBatches].slice(0, 5); // Keep last 5
        setRecentBatches(newHistory);
        localStorage.setItem('recent_batches', JSON.stringify(newHistory));
    };

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (role !== 'MANUFACTURER') {
            setError('Only MANUFACTURER role can create batches.');
            return;
        }

        setIsLoading(true);
        setCreatedBatchId(null);
        setError(null);

        // Security check for environment configuration
        if (!process.env.NEXT_PUBLIC_INTERNAL_API_KEY) {
            setError('Security configuration missing: NEXT_PUBLIC_INTERNAL_API_KEY is not defined in Vercel. Please add it to enable blockchain features.');
            setIsLoading(false);
            return;
        }

        const formData = new FormData(event.currentTarget);

        // Core fields for current API
        const manufacturer_id = formData.get('manufacturer_id') as string;
        const product_type = formData.get('product_type') as string;
        const batch_size = Number(formData.get('batch_size'));

        try {
            // Step 1: Upload to IPFS via Blockchain Service
            // We reuse the existing FormData because it already contains 'ingredients', 'certificates', etc.
            // We append the dates manually.
            if (productionDate) formData.append('productionDate', productionDate.toISOString());
            if (expirationDate) formData.append('expirationDate', expirationDate.toISOString());

            // The file input name is 'certificates', but our NestJS controller expects 'files'.
            // Simple fix: NestJS FileInterceptor('files') looks for field named 'files'.
            // We need to reconstruct a new FormData/or rename in existing one if we want strict matching.
            // Let's create a specific uploadPayload.
            const uploadPayload = new FormData();
            uploadPayload.append('manufacturer_id', manufacturer_id);
            uploadPayload.append('product_type', product_type);
            uploadPayload.append('batch_size', batch_size.toString());
            uploadPayload.append('unit_of_measure', formData.get('unit_of_measure') as string);
            uploadPayload.append('origin_country', formData.get('origin_country') as string);
            uploadPayload.append('destination_country', formData.get('destination_country') as string);
            uploadPayload.append('ingredients', formData.get('ingredients') || '');
            if (productionDate) uploadPayload.append('productionDate', productionDate.toISOString());
            if (expirationDate) uploadPayload.append('expirationDate', expirationDate.toISOString());
            uploadPayload.append('productionLocation', formData.get('production_location') || '');
            uploadPayload.append('originLocation', formData.get('origin_location') || '');

            // Build certificate mapping for backend
            const certMapping: Record<string, string> = {};
            Object.entries(uploadedCerts).forEach(([type, file]) => {
                uploadPayload.append('files', file);
                certMapping[file.name] = type;
            });
            uploadPayload.append('cert_mapping', JSON.stringify(certMapping));

            console.log("Uploading to IPFS with mapped certificates...", certMapping);
            const uploadRes = await fetch('/api/blockchain/ipfs/upload', {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY || ''
                },
                // No Content-Type header needed for FormData; browser sets boundary
                body: uploadPayload,
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                throw new Error(`IPFS Upload Failed: ${errText}`);
            }

            const uploadJson = await uploadRes.json();
            const tokenUri = uploadJson.ipfsHash;
            console.log("Upload Success. Hash:", tokenUri);

            // Step 2: Create Batch with Token URI and Universal Fields
            const batchData = {
                manufacturer_id,
                product_type,
                batch_size,
                unit_of_measure: formData.get('unit_of_measure') as string,
                origin_country: formData.get('origin_country') as string,
                destination_country: formData.get('destination_country') as string,
                template_id: selectedTemplateId,
                token_uri: tokenUri, // Pass the IPFS hash here
                certificates_ipfs: [] // Placeholder for future enhancement if needed
            };

            const response = await fetch('/api/passport/batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': role || 'MANUFACTURER', // Send role header
                },
                body: JSON.stringify(batchData),
            });

            if (response.status === 403) {
                throw new Error('Access Denied: You do not have permission to create batches.');
            }

            if (!response.ok) {
                throw new Error('Failed to create batch');
            }

            const json = await response.json();
            setCreatedBatchId(json.batch_id);
            saveToHistory(json.batch_id); // Save ID
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to create batch');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md p-8">
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                        <PackagePlus size={32} />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">{t('create_batch_title')}</h1>
                    <p className="text-sm text-gray-500">{t('create_batch_subtitle')}</p>
                </div>

                {createdBatchId ? (
                    <div className="flex flex-col items-center rounded-lg bg-green-50 p-6 text-center">
                        <CheckCircle className="mb-2 text-green-600" size={48} />
                        <h3 className="text-lg font-medium text-green-900">{t('msg_batch_created')}</h3>
                        <p className="mt-2 font-mono text-sm text-gray-600 break-all">{createdBatchId}</p>

                        <div className="flex justify-center my-4">
                            <QRCodeDisplay value={`${window.location.origin}/batches/${createdBatchId}`} size={150} />
                        </div>

                        <Link href={`/batches/${createdBatchId}`} className="mt-4 w-full">
                            <Button className="w-full">
                                {t('msg_track_status')}
                            </Button>
                        </Link>
                        <Button
                            className="mt-2 w-full"
                            variant="secondary"
                            onClick={() => setCreatedBatchId(null)}
                        >
                            {t('msg_create_another')}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        {role !== 'MANUFACTURER' && (
                            <div className="rounded-md bg-yellow-50 p-4 mb-4 border border-yellow-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">{t('permission_warning')}</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>{t('permission_warning_desc')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="manufacturer_id">
                                {t('form_manufacturer_id')}
                            </Label>
                            <Input
                                id="manufacturer_id"
                                name="manufacturer_id"
                                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                defaultValue={companyId || DEMO_MANUFACTURER_ID}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product_type">
                                {t('form_product_type')}
                            </Label>
                            <div className="relative">
                                <select
                                    id="product_type"
                                    name="product_type"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="PHO_BO_SOUP">Vietnam Soup (Pho Bo)</option>
                                    <option value="MANGO_SHAKE">Mango Shake</option>
                                    <option value="DRIED_MANGO">Dried Mango (Global)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="template_id" className="flex items-center gap-2">
                                <Layers size={14} className="text-blue-500" />
                                {t('form_select_template')}
                            </Label>
                            <div className="relative">
                                {isTemplatesLoading ? (
                                    <div className="flex items-center gap-2 h-10 px-3 text-sm text-gray-500 border rounded-md bg-gray-50">
                                        <Loader2 size={14} className="animate-spin" />
                                        {t('loading')}...
                                    </div>
                                ) : templatesError ? (
                                    <div className="flex items-center justify-between h-10 px-3 text-sm text-red-500 border border-red-200 rounded-md bg-red-50">
                                        <span className="truncate">{templatesError}</span>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={loadTemplates}
                                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                                        >
                                            <RefreshCw size={14} />
                                        </Button>
                                    </div>
                                ) : templates.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-md bg-gray-50 text-gray-400">
                                        <p className="text-xs italic mb-2 text-center">{t('compliance_empty_templates') || 'No templates available.'}</p>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={loadTemplates}
                                            className="h-8 text-xs gap-1.5"
                                        >
                                            <RefreshCw size={12} />
                                            {t('btn_retry') || 'Initialize System'}
                                        </Button>
                                    </div>
                                ) : (
                                    <select
                                        id="template_id"
                                        name="template_id"
                                        value={selectedTemplateId}
                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        {templates.map((tpl) => (
                                            <option key={tpl.id} value={tpl.id}>
                                                {tpl.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="batch_size">
                                    {t('form_batch_size')}
                                </Label>
                                <Input
                                    id="batch_size"
                                    name="batch_size"
                                    type="number"
                                    placeholder="100"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit_of_measure">
                                    {t('form_unit_of_measure')}
                                </Label>
                                <select
                                    id="unit_of_measure"
                                    name="unit_of_measure"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="kg">{t('unit_kg')}</option>
                                    <option value="lbs">{t('unit_lbs')}</option>
                                    <option value="units">{t('unit_units')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="origin_country">{t('form_production_location')}</Label>
                                <Input
                                    id="origin_country"
                                    name="origin_country"
                                    placeholder="e.g. Vietnam"
                                    defaultValue="Vietnam"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destination_country">{t('form_destination_country')}</Label>
                                <Input
                                    id="destination_country"
                                    name="destination_country"
                                    placeholder="e.g. USA"
                                    defaultValue="Global"
                                />
                            </div>
                        </div>

                        {/* Phase 1: New Data Fields */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {t('form_product_details_ipfs')}
                            </h3>

                            {/* Ingredients */}
                            <div className="space-y-2">
                                <Label htmlFor="ingredients">{t('form_ingredients')}</Label>
                                <Textarea
                                    id="ingredients"
                                    name="ingredients"
                                    placeholder="e.g. Beef, Rice Noodles, Star Anise, Cinnamon..."
                                    className="min-h-[100px]"
                                />
                            </div>

                            {/* Location Data */}
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="production_location">{t('form_production_location')}</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="production_location"
                                            name="production_location"
                                            placeholder="e.g. Dubai, UAE"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="origin_location">{t('form_origin_location')}</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="origin_location"
                                            name="origin_location"
                                            placeholder="e.g. Jebel Ali Port"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dates Row */}
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div className="space-y-2 text-left">
                                    <Label>{t('form_production_date')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !productionDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {productionDate ? format(productionDate, "PPP") : <span>{t('pick_date')}</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={productionDate}
                                                onSelect={setProductionDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label>{t('form_expiration_date')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !expirationDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {expirationDate ? format(expirationDate, "PPP") : <span>{t('pick_date')}</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={expirationDate}
                                                onSelect={setExpirationDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Compliance - Dynamic Certificates */}
                            <div className="space-y-4">
                                <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <FileCheck className="h-4 w-4 text-green-600" />
                                    {t('compliance_required_docs')}
                                </Label>
                                
                                {requiredCerts.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {requiredCerts.map((certType) => (
                                            <div key={certType} className="relative group">
                                                <div className={cn(
                                                    "flex items-center justify-between p-3 border rounded-lg transition-all",
                                                    uploadedCerts[certType] ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-blue-300"
                                                )}>
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={cn(
                                                            "p-2 rounded-md",
                                                            uploadedCerts[certType] ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                                        )}>
                                                            <Upload size={16} />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden text-left">
                                                            <span className="text-xs font-medium text-gray-900 truncate uppercase">
                                                                {certType.replace(/_/g, ' ')}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 truncate">
                                                                {uploadedCerts[certType] ? uploadedCerts[certType].name : t('btn_upload_file')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {uploadedCerts[certType] ? (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newCerts = { ...uploadedCerts };
                                                                delete newCerts[certType];
                                                                setUploadedCerts(newCerts);
                                                            }}
                                                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                        >
                                                            <X size={14} />
                                                        </Button>
                                                    ) : (
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                id={`file-${certType}`}
                                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        setUploadedCerts(prev => ({ ...prev, [certType]: file }));
                                                                    }
                                                                }}
                                                            />
                                                            <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
                                                                {t('btn_upload_file')}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center border border-dashed rounded-lg bg-gray-50">
                                        <p className="text-xs text-gray-400">{t('compliance_optional_docs')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {/* {error && <p className="text-sm text-red-600">{error}</p>} */}

                        <Button className="w-full" disabled={isLoading} type="submit">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('menu_create_batch')}
                        </Button>
                    </form>
                )}
                {/* Recent Batches Sidebar or Bottom Block */}
                {recentBatches.length > 0 && !createdBatchId && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">{t('recent_batches_title')}</h3>
                        <div className="flex flex-wrap gap-2">
                            {recentBatches.map((id) => (
                                <Link key={id} href={`/batches/${id}`}>
                                    <div className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs text-gray-600 font-mono transition-colors">
                                        {id.slice(0, 8)}...
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <p className="mt-8 text-center text-xs text-gray-400">
                Global FoodTech Bridge &copy; 2024
            </p>
        </div>
    );
}
