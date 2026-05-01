import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Skeleton */}
      <div className="bg-emerald-600 p-12 rounded-b-[3rem] shadow-xl">
        <div className="max-w-md mx-auto text-center space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto bg-white/20" />
          <Skeleton className="h-10 w-64 mx-auto bg-white/20" />
          <Skeleton className="h-4 w-48 mx-auto bg-white/20" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8 space-y-6">
        {/* Product Card Skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Sustainability Skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-md h-48" />

        {/* Timeline Skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-md h-64" />
      </div>
    </div>
  );
}
