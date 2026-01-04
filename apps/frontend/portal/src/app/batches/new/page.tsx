'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { PackagePlus, CheckCircle, Loader2, Calendar as CalendarIcon, Upload, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { DEMO_MANUFACTURER_ID } from '@/lib/constants';
import { useAuth } from '@/components/providers/AuthProvider';
import { AlertTriangle } from 'lucide-react'; // Import AlertIcon

export default function CreateBatchPage() {
    const { role } = useAuth(); // Get current role
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

        // Basic fields for current API
        const data = {
            manufacturer_id: formData.get('manufacturer_id'),
            product_type: formData.get('product_type'),
            batch_size: Number(formData.get('batch_size')),
        };

        // Phase 1: Collect new data (Consoles only for now)
        const certificates = formData.getAll('certificates');
        const ingredients = formData.get('ingredients');
        const extendedData = {
            ...data,
            ingredients,
            productionDate: productionDate ? productionDate.toISOString() : null,
            expirationDate: expirationDate ? expirationDate.toISOString() : null,
            certificateCount: certificates.length
        };
        console.log("Phase 1 Data Collection:", extendedData);
        console.log("Certificates Files:", certificates);

        try {
            const response = await fetch('/api/passport/batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': role, // Send role header
                },
                body: JSON.stringify(data),
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
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">Create New Batch</h1>
                    <p className="text-sm text-gray-500">Enter production details below</p>
                </div>

                {createdBatchId ? (
                    <div className="flex flex-col items-center rounded-lg bg-green-50 p-6 text-center">
                        <CheckCircle className="mb-2 text-green-600" size={48} />
                        <h3 className="text-lg font-medium text-green-900">Batch Created!</h3>
                        <p className="mt-2 font-mono text-sm text-gray-600 break-all">{createdBatchId}</p>

                        <div className="flex justify-center my-4">
                            <QRCodeDisplay value={`${window.location.origin}/batches/${createdBatchId}`} size={150} />
                        </div>

                        <Link href={`/batches/${createdBatchId}`} className="mt-4 w-full">
                            <Button className="w-full">
                                Track Batch Status
                            </Button>
                        </Link>
                        <Button
                            className="mt-2 w-full"
                            variant="secondary"
                            onClick={() => setCreatedBatchId(null)}
                        >
                            Create Another
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
                                        <h3 className="text-sm font-medium text-yellow-800">Permission Warning</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>You are currently logged in as <strong>{role}</strong>.</p>
                                            <p>Only <strong>MANUFACTURER</strong> can create new batches.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="manufacturer_id">
                                Manufacturer ID
                            </Label>
                            <Input
                                id="manufacturer_id"
                                name="manufacturer_id"
                                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                defaultValue={DEMO_MANUFACTURER_ID}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product_type">
                                Product Type
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
                                Batch Size
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
                                Product Details (IPFS)
                            </h3>

                            {/* Ingredients */}
                            <div className="space-y-2">
                                <Label htmlFor="ingredients">Ingredients List</Label>
                                <Textarea
                                    id="ingredients"
                                    name="ingredients"
                                    placeholder="e.g. Beef, Rice Noodles, Star Anise, Cinnamon..."
                                    className="min-h-[100px]"
                                />
                            </div>

                            {/* Dates Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 text-left">
                                    <Label>Production Date</Label>
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
                                                {productionDate ? format(productionDate, "PPP") : <span>Pick a date</span>}
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
                                    <Label>Expiration Date</Label>
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
                                                {expirationDate ? format(expirationDate, "PPP") : <span>Pick a date</span>}
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
                                    Certificates (PDF/JPG)
                                </Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="certificates" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
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
                            Register Batch
                        </Button>
                    </form>
                )}
                {/* Recent Batches Sidebar or Bottom Block */}
                {recentBatches.length > 0 && !createdBatchId && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Recently Created Batches (Local)</h3>
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
