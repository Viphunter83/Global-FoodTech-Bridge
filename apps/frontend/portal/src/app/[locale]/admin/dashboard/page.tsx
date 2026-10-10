import { requireAdmin } from '@/lib/admin-guard';
import { getAdminBatches, getBlockchainAdminStatus } from '@/lib/api';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Metadata } from 'next';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        locale: string;
    };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'Admin' });
    
    return {
        title: `${t('dashboard_title')} | GFTB Admin`,
        description: t('dashboard_description'),
    };
}

export default async function AdminDashboardPage({ params: { locale } }: PageProps) {
    unstable_setRequestLocale(locale);
    
    // In a server component, we use the internal API key automatically via lib/api.ts
    // because isServer will be true.
    const { token } = await requireAdmin();
    const [batches, chainStatus] = await Promise.all([
        getAdminBatches(token),
        getBlockchainAdminStatus(token),
    ]);
    const gasBalance: string | null = chainStatus?.wallets?.[0]?.balance ?? null;

    return (
        <div className="container mx-auto">
            <AdminDashboard batches={batches} gasBalance={gasBalance} />
        </div>
    );
}

