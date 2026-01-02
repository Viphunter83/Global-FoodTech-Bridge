import Link from 'next/link';
import { ArrowLeft, Database, ShieldCheck, Thermometer, Truck, FileCheck, Server } from 'lucide-react';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-slate-900 px-6 py-24 sm:py-32 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                        How Global FoodTech Bridge Works
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        Ensuring food safety, Halal compliance, and transparency from farm to table using Blockchain and IoT technologies.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/" className="text-sm font-semibold leading-6 text-white">
                            <ArrowLeft className="inline mr-2 h-4 w-4" />
                            Back to App
                        </Link>
                    </div>
                </div>
            </div>

            {/* The 3 Pillars */}
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

                    {/* Pillar 1: Digital Passport */}
                    <div className="flex flex-col">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <FileCheck className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">1. Digital Passport & Halal</h3>
                        <p className="mt-4 text-base leading-7 text-gray-600">
                            At the point of manufacturing, a unique <strong>Digital Passport</strong> is created for every batch.
                            This includes immutable records of ingredients, certificates (like Halal), and expiration dates.
                        </p>
                        <div className="mt-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                            <strong>Role in Blockchain:</strong> The initial state of the product is hashed and "Notarized".
                            This guarantees that no one can alter the production date or ingredients list later.
                        </div>
                    </div>

                    {/* Pillar 2: IoT Logistics */}
                    <div className="flex flex-col">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <Thermometer className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">2. Smart Logistics</h3>
                        <p className="mt-4 text-base leading-7 text-gray-600">
                            During transit, IoT sensors continuously monitor temperature and location.
                            If the temperature goes outside the safe range (e.g., -18°C for frozen soup), an <strong>SLA Alert</strong> is instantly generated.
                        </p>
                        <div className="mt-4 rounded-md bg-indigo-50 p-4 text-sm text-indigo-800">
                            <strong>Role in Blockchain:</strong> Violations can be recorded on-chain, automatically invalidating the "Premium" or "Safe" status of the batch.
                        </div>
                    </div>

                    {/* Pillar 3: Handover & Trust */}
                    <div className="flex flex-col">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">3. Trusted Handover</h3>
                        <p className="mt-4 text-base leading-7 text-gray-600">
                            When the Retailer receives the goods, they verify the digital signature.
                            The Blockchain acts as a "Digital Notary", confirming that the data they see matches exactly what the Manufacturer shipped.
                        </p>
                        <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
                            <strong>Guarantee:</strong> Mathematical proof that the supply chain data hasn't been tampered with by any intermediary.
                        </div>
                    </div>

                </div>
            </div>

            {/* Architecture Diagram (Simplified) */}
            <div className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">System Architecture</h2>
                    <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:justify-center">
                        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 text-center w-64">
                            <Server className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                            <h4 className="font-semibold">Passport Service</h4>
                            <p className="text-xs text-gray-500 mt-2">Core Data Registry</p>
                        </div>
                        <div className="hidden md:block text-gray-300">➜</div>
                        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 text-center w-64">
                            <Database className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                            <h4 className="font-semibold">PostgreSQL</h4>
                            <p className="text-xs text-gray-500 mt-2">Secure Storage</p>
                        </div>
                        <div className="hidden md:block text-gray-300">➜</div>
                        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 text-center w-64 ring-2 ring-purple-600 bg-purple-50">
                            <ShieldCheck className="mx-auto h-8 w-8 text-purple-600 mb-4" />
                            <h4 className="font-semibold text-purple-900">Polygon Blockchain</h4>
                            <p className="text-xs text-purple-700 mt-2">Public Verification Layer</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white px-6 py-24 sm:py-32 lg:px-8">
                <div className="mx-auto max-w-2xl divide-y divide-gray-900/10">
                    <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Frequently Asked Questions</h2>
                    <dl className="mt-10 space-y-8 divide-y divide-gray-900/10">

                        <div className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                            <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">
                                How does the buyer verify the product?
                            </dt>
                            <dd className="mt-4 lg:col-span-7 lg:mt-0">
                                <p className="text-base leading-7 text-gray-600">
                                    Simply by scanning the QR code with any smartphone camera. No special app is required.
                                    The web app instantly checks the Blockchain in the background and displays a <span className="text-green-600 font-medium">Verified Shield</span> if the data matches the immutable record.
                                </p>
                            </dd>
                        </div>

                        <div className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                            <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">
                                What if the driver forgets to update the status?
                            </dt>
                            <dd className="mt-4 lg:col-span-7 lg:mt-0">
                                <p className="text-base leading-7 text-gray-600">
                                    We use <strong>IoT Sensors</strong> that report data automatically.
                                    Additionally, Smart Contracts can be programmed to release payment only when both the 'Handover' and 'Temperature Compliance' records are present on the blockchain, motivating all parties to follow the protocol.
                                </p>
                            </dd>
                        </div>

                        <div className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                            <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">
                                Does the hash change during shipping?
                            </dt>
                            <dd className="mt-4 lg:col-span-7 lg:mt-0">
                                <p className="text-base leading-7 text-gray-600">
                                    No. The original "Product Passport" hash remains immutable.
                                    Logistics events (like temperature checks or handovers) are added as <strong>new, separate attributes</strong> linked to that original ID.
                                    It works like a paper passport: the main page doesn't change, but customs officers add new stamps on empty pages.
                                </p>
                            </dd>
                        </div>

                        <div className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                            <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">
                                Why use Polygon Blockchain?
                            </dt>
                            <dd className="mt-4 lg:col-span-7 lg:mt-0">
                                <p className="text-base leading-7 text-gray-600">
                                    Polygon provides the security of Ethereum but with significantly lower transaction costs and faster speeds.
                                    It acts as a <strong>Public Digital Notary</strong> that proves our database hasn't been tampered with by administrators or hackers.
                                </p>
                            </dd>
                        </div>

                    </dl>
                </div>
            </div>
        </div>
    );
}
