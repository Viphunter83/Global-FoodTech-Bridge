import { ProtocolManager } from '@/components/admin/ProtocolManager';

import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
    const { locale } = params;
    const t = await getTranslations({ locale, namespace: 'Admin' });
    
    return {
        title: `${t('admin_protocols_title')} | GFTB Admin`,
        description: t('admin_protocols_subtitle'),
    };
}

export default function ProtocolsPage({ params: { locale } }: { params: { locale: string } }) {
    unstable_setRequestLocale(locale);
    return (
        <div className="container mx-auto">
            <ProtocolManager />
        </div>
    );
}
