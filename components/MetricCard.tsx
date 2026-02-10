
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPIResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    score: number;
    status: KPIResult["status"];
    description?: string;
    className?: string;
}

export function MetricCard({
    title,
    score,
    status,
    description,
    className,
}: MetricCardProps) {
    const getStatusColor = (s: KPIResult["status"]) => {
        switch (s) {
            case "PASS":
                return "success";
            case "WARNING":
                return "warning";
            case "FAIL":
                return "destructive";
            default:
                return "default";
        }
    };

    return (
        <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Badge variant={getStatusColor(status)}>{status}</Badge>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{score}</div>
                {description && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
