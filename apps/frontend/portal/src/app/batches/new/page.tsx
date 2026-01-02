'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PackagePlus, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateBatchPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ batch_id: string; status: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData(event.currentTarget);
        const data = {
            manufacturer_id: formData.get('manufacturer_id'),
            product_type: formData.get('product_type'),
            batch_size: Number(formData.get('batch_size')),
        };

        try {
            const response = await fetch('/api/passport/batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to create batch');
            }

            const json = await response.json();
            setResult(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
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

                {result ? (
                    <div className="flex flex-col items-center rounded-lg bg-green-50 p-6 text-center">
                        <CheckCircle className="mb-2 text-green-600" size={48} />
                        <h3 className="text-lg font-medium text-green-900">Batch Created!</h3>
                        <p className="mt-2 font-mono text-sm text-gray-600 break-all">{result.batch_id}</p>
                        <Link href={`/batches/${result.batch_id}`} className="mt-4 w-full">
                            <Button className="w-full">
                                Track Batch Status
                            </Button>
                        </Link>
                        <Button
                            className="mt-2 w-full"
                            variant="secondary"
                            onClick={() => setResult(null)}
                        >
                            Create Another
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Manufacturer ID
                            </label>
                            <Input
                                name="manufacturer_id"
                                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Product Type
                            </label>
                            <div className="relative">
                                <select
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
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Batch Size
                            </label>
                            <Input
                                name="batch_size"
                                type="number"
                                placeholder="100"
                                min="1"
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button className="w-full" disabled={isLoading} type="submit">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Register Batch
                        </Button>
                    </form>
                )}
            </Card>

            <p className="mt-8 text-center text-xs text-gray-400">
                Global FoodTech Bridge &copy; 2024
            </p>
        </div>
    );
}
