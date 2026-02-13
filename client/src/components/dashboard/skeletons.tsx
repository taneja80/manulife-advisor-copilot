import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroStatCardSkeleton() {
    return (
        <Card className="h-full">
            <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                </div>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
            </CardContent>
        </Card>
    );
}

export function ChartSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16" />
            </CardHeader>
            <CardContent className="pb-4">
                <div className="h-[200px] flex items-center justify-center">
                    <Skeleton className="h-full w-full rounded-md" />
                </div>
            </CardContent>
        </Card>
    );
}

export function GoalCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
        </Card>
    );
}
