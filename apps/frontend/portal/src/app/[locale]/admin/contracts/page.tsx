import { requireAdmin } from '@/lib/admin-guard';
import { getBlockchainAdminStatus } from '@/lib/api';
import { BlockchainMonitor } from '@/components/admin/BlockchainMonitor';
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
        title: `${t('contracts_title')} | GFTB Admin`,
        description: t('contracts_description'),
    };
}

export default async function BlockchainAdminPage({ params: { locale } }: PageProps) {
    unstable_setRequestLocale(locale);
    
    const { token } = await requireAdmin();
    const status = await getBlockchainAdminStatus(token);

    // If the blockchain service is unreachable, say so instead of showing invented wallets
    const fallbackStatus = {
        mode: 'UNAVAILABLE',
        network: '—',
        contract: '—',
        wallets: [],
    };

    return (
        <div className="container mx-auto">
            <BlockchainMonitor status={status || fallbackStatus} />
        </div>
    );
}

