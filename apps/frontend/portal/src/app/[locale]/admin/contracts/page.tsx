import { getBlockchainAdminStatus } from '@/lib/api';
import { BlockchainMonitor } from '@/components/admin/BlockchainMonitor';
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
        title: `${t('contracts_title')} | GFTB Admin`,
        description: t('contracts_description'),
    };
}

export default async function BlockchainAdminPage({ params: { locale } }: PageProps) {
    unstable_setRequestLocale(locale);
    
    const status = await getBlockchainAdminStatus();

    // Fallback if API fails
    const fallbackStatus = {
        mode: 'MOCK',
        network: 'Polygon Mainnet',
        contract: '0x28976C68c7694939f506e60b7F624C46C96489a2',
        wallets: [
            { name: 'Manufacturer (Admin)', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', balance: '42.5 MATIC' },
            { name: 'Logistics Partner', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', balance: '12.8 MATIC' },
            { name: 'Retailer Partner', address: '0x21a31Ee1afC51d94C2eFcCAa2092aD10282f4341', balance: '5.2 MATIC' }
        ]
    };

    return (
        <div className="container mx-auto">
            <BlockchainMonitor status={status || fallbackStatus} />
        </div>
    );
}

