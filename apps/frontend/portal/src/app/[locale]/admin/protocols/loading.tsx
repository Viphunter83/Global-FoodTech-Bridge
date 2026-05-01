import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProtocolsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-8 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
