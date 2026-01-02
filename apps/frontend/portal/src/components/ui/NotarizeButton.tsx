'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { notarizeBatch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function NotarizeButton({ batchId }: { batchId: string }) {
    const { role } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Only MANUFACTURER can notarize
    if (role !== 'MANUFACTURER') {
        return null; // or disabled button with tooltip
    }

    const handleNotarize = async () => {
        if (!confirm('This will write to the Polygon Blockchain. Continue?')) return;

        setIsLoading(true);
        try {
            // For MVP, we use the Batch ID itself as the hash payload, or a placeholder
            const res = await notarizeBatch(batchId, `hash-${batchId.slice(0, 8)}`);
            if (res.status === 'success') {
                alert(`Notarization started! TX: ${res.txHash}`);
                router.refresh(); // Refresh to show "Secured" status (once confirmed)
            } else {
                alert('Notarization failed. Check console.');
            }
        } catch (e) {
            console.error(e);
            alert('Error during notarization');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleNotarize}
            disabled={isLoading}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-50"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            Notarize on Blockchain
        </Button>
    );
}
