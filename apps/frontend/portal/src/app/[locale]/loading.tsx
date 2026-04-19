import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50 bg-opacity-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading Global FoodTech Bridge...</p>
            </div>
        </div>
    );
}
