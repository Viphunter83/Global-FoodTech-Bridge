import { ProtocolManager } from '@/components/admin/ProtocolManager';

export const metadata = {
    title: 'Compliance Protocols | GFTB Admin',
    description: 'Manage supply chain templates and compliance requirements.',
};

export default function ProtocolsPage() {
    return (
        <div className="container mx-auto">
            <ProtocolManager />
        </div>
    );
}
