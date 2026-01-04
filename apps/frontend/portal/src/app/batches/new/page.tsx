'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { PackagePlus, CheckCircle, Loader2, Calendar as CalendarIcon, Upload, FileText, MapPin } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { DEMO_MANUFACTURER_ID } from '@/lib/constants';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { AlertTriangle } from 'lucide-react'; // Import AlertIcon

export default function CreateBatchPage() {
    const { role, companyId } = useAuth(); // Get current role and companyId
    const { t, dir } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
    const [recentBatches, setRecentBatches] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // New Data Collection States (Phase 1)
    const [productionDate, setProductionDate] = useState<Date>();
    const [expirationDate, setExpirationDate] = useState<Date>();

    useEffect(() => {
        // Load recent batches on mount
        const stored = localStorage.getItem('recent_batches');
        if (stored) {
            try {
                setRecentBatches(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }
    }, []);

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
            uploadPayload.append('ingredients', formData.get('ingredients') || '');
            if (productionDate) uploadPayload.append('productionDate', productionDate.toISOString());
            if (productionDate) uploadPayload.append('productionDate', productionDate.toISOString());
            if (expirationDate) uploadPayload.append('expirationDate', expirationDate.toISOString());
            uploadPayload.append('productionLocation', formData.get('production_location') || '');
            uploadPayload.append('originLocation', formData.get('origin_location') || '');

            const certFiles = formData.getAll('certificates');
            certFiles.forEach((file) => {
                if (file instanceof File && file.size > 0) {
                    uploadPayload.append('files', file);
                }
            });

            console.log("Uploading to IPFS...");
            const uploadRes = await fetch('/api/blockchain/ipfs/upload', {
                method: 'POST',
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

            // Step 2: Create Batch with Token URI
            const batchData = {
                manufacturer_id,
                product_type,
                batch_size,
                token_uri: tokenUri // Pass the IPFS hash here
            };

            const response = await fetch('/api/passport/batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': role, // Send role header
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
                                </select>
                            </div>
                        </div>

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
                            <div className="grid grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-2 gap-4">
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

                            {/* Certificates */}
                            <div className="space-y-2">
                                <Label htmlFor="certificates">
                                    {t('form_certificates')}
                                </Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="certificates" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t('form_certificates_sub')}</span></p>
                                            <p className="text-xs text-gray-500">PDF, JPG or PNG</p>
                                        </div>
                                        <Input
                                            id="certificates"
                                            name="certificates"
                                            type="file"
                                            multiple
                                            className="hidden"
                                        />
                                    </label>
                                </div>
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
