import { FileCheck, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CertificateCardProps {
    title: string;
    issuer: string;
    date: string;
    type: 'halal' | 'haccp' | 'iso';
}

export function CertificateCard({ title, issuer, date, type }: CertificateCardProps) {
    const colorMap = {
        halal: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        haccp: 'bg-blue-50 text-blue-700 border-blue-100',
        iso: 'bg-purple-50 text-purple-700 border-purple-100'
    };

    return (
        <Card className={`flex items-center justify-between p-4 border transition-shadow hover:shadow-md ${colorMap[type]}`}>
            <div className="flex items-center gap-4">
                <div className="rounded-full bg-white p-2 shadow-sm">
                    <FileCheck className="h-6 w-6 opacity-80" />
                </div>
                <div>
                    <h4 className="font-bold">{title}</h4>
                    <p className="text-xs opacity-80">Issued by {issuer} • {date}</p>
                </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink size={16} />
            </Button>
        </Card>
    );
}
