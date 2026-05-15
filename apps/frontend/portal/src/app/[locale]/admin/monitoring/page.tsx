import { fetchInfrastructureStatus } from '@/lib/railway';
import { InfrastructureStatus } from '@/components/admin/InfrastructureStatus';
import { revalidatePath } from 'next/cache';
import { Metadata } from 'next';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

interface PageProps {
    params: {
        locale: string;
    };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'Admin' });
    
    return {
        title: `${t('monitoring_title')} | GFTB Admin`,
        description: t('monitoring_description'),
    };
}

export default async function MonitoringPage({ params: { locale } }: PageProps) {
    unstable_setRequestLocale(locale);

    const refreshData = async () => {
        'use server';
        revalidatePath(`/${locale}/admin/monitoring`);
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
        throw new Error(`Failed to render monitoring page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

