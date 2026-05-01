import { getAdminBatches } from '@/lib/api';
import { StageWizard } from '@/components/admin/StageWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/navigation';

export const metadata = {
    title: 'Stage Wizard | GFTB Admin',
    description: 'Admin Simulation Environment for Supply Chain Lifecycle.',
};

export default async function AdminDemoPage() {
    const batches = await getAdminBatches();

    return (
        <div className="space-y-8">
            <Link href="/admin/dashboard">
                <Button variant="ghost" className="rounded-xl hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest gap-2">
                    <ArrowLeft size={16} />
                    Back to Command Center
                </Button>
            </Link>
            
            <StageWizard batches={batches} />
        </div>
    );
}
