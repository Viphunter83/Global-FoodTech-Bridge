import { useTranslations } from 'next-intl';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
    const t = useTranslations('Admin');

    return (
        <div className="space-y-12 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-2xl bg-slate-100" />
                        <div>
                            <Skeleton className="h-10 w-48 bg-slate-100 mb-2" />
                            <Skeleton className="h-3 w-32 bg-slate-100" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-32 rounded-2xl bg-slate-100" />
                    <Skeleton className="h-12 w-48 rounded-2xl bg-slate-100" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-[2.5rem] bg-slate-100" />
                ))}
            </div>

            <div className="rounded-[3rem] bg-white border border-slate-100 shadow-xl overflow-hidden h-96">
                <div className="p-10 space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
                            <Skeleton className="h-4 flex-1 bg-slate-100" />
                            <Skeleton className="h-4 w-24 bg-slate-100" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
