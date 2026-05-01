import { getAdminBatches } from '@/lib/api';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { auth } from '@/lib/firebase-admin'; // Use server-side admin SDK if possible, or just call with internal key

export const metadata = {
    title: 'Command Center | GFTB Admin',
    description: 'Global operations control and supply chain monitoring.',
};

export default async function AdminDashboardPage() {
    // In a server component, we use the internal API key automatically via lib/api.ts
    // because isServer will be true.
    const batches = await getAdminBatches();

    return (
        <div className="container mx-auto">
            <AdminDashboard batches={batches} />
        </div>
    );
}
