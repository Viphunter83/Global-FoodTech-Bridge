import { getAdminBatches } from '@/lib/api';
import { StageWizard } from '@/components/admin/StageWizard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@/navigation';
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
        title: `${t('stage_wizard_title')} | GFTB Admin`,
        description: t('stage_wizard_subtitle'),
    };
}

export default async function DemoPage({ params: { locale } }: PageProps) {
    unstable_setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Admin' });
    const batches = await getAdminBatches();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" title={t('back_to_command_center')} asChild>
                    <Link href="/admin/dashboard">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('stage_wizard_title')}</h1>
                    <p className="text-muted-foreground">
                        {t('stage_wizard_subtitle')}
                    </p>
                </div>
            </div>

            <StageWizard batches={batches} />
        </div>
    );
}
