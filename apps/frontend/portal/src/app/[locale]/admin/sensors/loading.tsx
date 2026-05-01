import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSensorsLoading() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-32 rounded-2xl" />
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-48 w-full rounded-[2.5rem]" />
        <Skeleton className="h-48 w-full rounded-[2.5rem]" />
        <Skeleton className="h-48 w-full rounded-[2.5rem]" />
      </div>

      <div className="rounded-[3rem] bg-white border border-slate-100 shadow-xl p-8 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
