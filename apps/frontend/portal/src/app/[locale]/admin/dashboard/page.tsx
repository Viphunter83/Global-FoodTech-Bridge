import { redirect } from 'next/navigation';

export default function AdminDashboardRedirect({ params: { locale } }: { params: { locale: string } }) {
    // Redirect /admin/dashboard to the monitoring section
    redirect(`/${locale}/admin/monitoring`);
}
