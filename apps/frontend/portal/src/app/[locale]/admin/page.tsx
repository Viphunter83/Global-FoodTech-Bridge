import { redirect } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default function AdminPage({ params: { locale } }: { params: { locale: string } }) {
    unstable_setRequestLocale(locale);
    // Redirect to the default monitoring view as the root admin page
    redirect(`/${locale}/admin/monitoring`);
}
