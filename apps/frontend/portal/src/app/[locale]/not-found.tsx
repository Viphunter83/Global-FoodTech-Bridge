'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-6">{t('title')}</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                {t('description')}
            </p>
            <Link 
                href="/" 
                className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:shadow-lg transition-all"
            >
                {t('back_home')}
            </Link>
        </div>
    );
}
