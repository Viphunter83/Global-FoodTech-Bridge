
import { fetchInfrastructureStatus } from '@/lib/railway';
import { InfrastructureStatus } from '@/components/admin/InfrastructureStatus';
import { revalidatePath } from 'next/cache';

export const metadata = {
    title: 'Monitoring | GFTB Admin',
    description: 'Infrastructure status and service health.',
};

export default async function MonitoringPage() {
    const data = await fetchInfrastructureStatus();

    async function refreshData() {
        'use server';
        revalidatePath('/admin/monitoring');
    }

    return (
        <div className="container mx-auto">
            <InfrastructureStatus 
                data={data} 
                onRefresh={refreshData} 
            />
        </div>
    );
}
