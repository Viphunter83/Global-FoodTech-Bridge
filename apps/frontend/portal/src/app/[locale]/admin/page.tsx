import { redirect } from 'next/navigation';

export default function AdminPage({ params: { locale } }: { params: { locale: string } }) {
    // Redirect to the default monitoring view as the root admin page
    redirect(`/${locale}/admin/monitoring`);
}
