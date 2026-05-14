
import { fetchInfrastructureStatus } from '@/lib/railway';
import { InfrastructureStatus } from '@/components/admin/InfrastructureStatus';
import { revalidatePath } from 'next/cache';

export const metadata = {
    title: 'Monitoring | GFTB Admin',
    description: 'Infrastructure status and service health.',
};

export default async function MonitoringPage() {
    const refreshData = async () => {
        'use server';
        revalidatePath('/admin/monitoring');
    };

    try {
        console.log('[GFTB-SSR] Fetching infrastructure status...');
        const data = await fetchInfrastructureStatus();
        console.log(`[GFTB-SSR] Data fetched successfully: ${data.length} projects found.`);

        return (
            <div className="container mx-auto">
                <InfrastructureStatus 
                    data={data} 
                    onRefresh={refreshData} 
                />
            </div>
        );
    } catch (error) {
        console.error('[GFTB-SSR] CRITICAL ERROR in MonitoringPage:', error);
        // Throw a more descriptive error that might be caught by an error boundary
        throw new Error(`Failed to render monitoring page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
