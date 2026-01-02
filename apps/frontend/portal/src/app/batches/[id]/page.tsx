import { getBatchDetails, getTelemetry, getBlockchainStatus, getAlerts } from '@/lib/api';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, MapPin, Thermometer, AlertTriangle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { DashboardQR } from '@/components/ui/DashboardQR';
import { NotarizeButton } from '@/components/ui/NotarizeButton';

export default async function BatchDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // Parallel data fetching
    const [batch, telemetry, blockchain, alerts] = await Promise.all([
        getBatchDetails(id),
        getTelemetry(id),
        getBlockchainStatus(id),
        getAlerts(id),
    ]);

    if (!batch) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {batch.product_type.replace('_', ' ')}
                        </h1>
                        <p className="font-mono text-sm text-gray-500 mt-1">
                            Batch ID: {batch.id}
                            {batch.min_temp !== undefined && (
                                <span className="ml-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                    Target: {batch.min_temp}°C to {batch.max_temp}°C
                                </span>
                            )}
                        </p>
                    </div>

                    {blockchain.verified && (
                        <div className="flex items-center rounded-full bg-green-100 px-4 py-2 text-green-700 ring-1 ring-green-600/20">
                            <ShieldCheck className="mr-2 h-5 w-5" />
                            <span className="text-sm font-medium">Secured on Polygon</span>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">

                    {/* Alerts Banner */}
                    {alerts.length > 0 && (
                        <div className="col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Attention: SLA Violations Detected</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <ul role="list" className="list-disc space-y-1 pl-5">
                                            {alerts.slice(0, 3).map((alert) => (
                                                <li key={alert.id}>
                                                    <span className="font-semibold">{new Date(alert.created_at).toLocaleTimeString()}:</span> {alert.message}
                                                </li>
                                            ))}
                                            {alerts.length > 3 && (
                                                <li>...and {alerts.length - 3} more</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Temperature Chart */}
                    <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="mr-3 rounded-lg bg-blue-100 p-2 text-blue-600">
                                    <Thermometer className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Temperature History</h2>
                                    <p className="text-sm text-gray-500">Real-time sensor data</p>
                                </div>
                            </div>
                        </div>
                        <TemperatureChart data={telemetry} />
                    </div>

                    {/* Map Placeholder */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center">
                            <div className="mr-3 rounded-lg bg-indigo-100 p-2 text-indigo-600">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Location Tracking</h2>
                        </div>
                        <div className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                            <div className="text-center">
                                <p className="font-medium">Map Interface</p>
                                <p className="text-sm">Last known: 55.75° N, 37.61° E</p>
                            </div>
                        </div>
                    </div>

                    {/* Blockchain Info */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Blockchain Validation</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-500">Transaction Hash</p>
                                <p className="break-all font-mono text-xs text-gray-700">
                                    {blockchain.txHash || 'Pending...'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-500">Notary Authority</p>
                                <p className="text-sm text-gray-700">Global FoodTech Bridge Smart Contract</p>
                            </div>
                            {blockchain.txHash && (
                                <a
                                    href={`https://mumbai.polygonscan.com/tx/${blockchain.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                                >
                                    View on Block Explorer &rarr;
                                </a>
                            )}

                            {!blockchain.verified && (
                                <div className="pt-2">
                                    <NotarizeButton batchId={batch.id} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center">
                        <DashboardQR batchId={id} />
                        <p className="mt-2 text-center text-xs text-gray-500">Scan to Share</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
