
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3">
                    <Skeleton className="h-10 w-[300px]" />
                    <Skeleton className="h-5 w-[200px]" />
                </div>
                <Skeleton className="h-12 w-[150px]" />
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-5 w-[100px]" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-2" />
                            <Skeleton className="h-4 w-[120px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Chart Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-7 w-[200px]" />
                        <Skeleton className="h-4 w-[300px] mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[350px] w-full rounded-xl" />
                    </CardContent>
                </Card>

                {/* Status/QR Side Skeleton */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[140px]" />
                        </CardHeader>
                        <CardContent className="flex justify-center py-6">
                            <Skeleton className="h-48 w-48 rounded-lg" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[180px]" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
