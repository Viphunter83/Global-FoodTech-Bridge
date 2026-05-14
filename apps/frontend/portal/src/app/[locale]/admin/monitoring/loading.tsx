import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Server, Activity } from 'lucide-react';

export default function MonitoringLoading() {
  return (
    <div className="container mx-auto space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/10">
            <Activity size={28} className="text-primary/20 animate-pulse" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-16 w-48 rounded-[1.5rem]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-[2.5rem] border border-primary/5 glass overflow-hidden">
            <CardHeader className="pb-6 pt-8 px-8 border-b border-primary/5">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-6 w-20 rounded-xl" />
              </div>
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-3 w-24 rounded-md mt-2" />
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[4rem] border-0 glass overflow-hidden relative">
        <div className="p-16 space-y-8">
          <Skeleton className="h-12 w-96 rounded-2xl" />
          <div className="flex gap-24">
            <div className="space-y-4">
              <Skeleton className="h-24 w-48 rounded-3xl" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-24 w-48 rounded-3xl" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
