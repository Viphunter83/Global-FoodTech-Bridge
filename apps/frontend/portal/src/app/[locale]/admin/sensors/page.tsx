import { getDevices } from '@/lib/api';
import { SensorsClient } from './SensorsClient';
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
        title: `${t('sensors_title')} | GFTB Admin`,
        description: t('sensors_description'),
    };
}

export default async function SensorsPage({ params: { locale } }: PageProps) {
    unstable_setRequestLocale(locale);
    
    // Fetch initial data on the server
    const initialSensors = await getDevices();

    return (
        <SensorsClient initialSensors={initialSensors} />
    );
}

