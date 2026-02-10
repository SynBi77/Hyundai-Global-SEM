
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
    title: string;
    metricValue: string;
    metricLabel: string;
    actionText: string;
    onAction?: () => void;
    severity?: "high" | "medium" | "low";
}

export function ActionCard({
    title,
    metricValue,
    metricLabel,
    actionText,
    onAction,
    severity = "medium",
}: ActionCardProps) {
    return (
        <Card className="mb-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">
                    {title}
                </CardTitle>
                {severity === "high" && (
                    <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                        <AlertCircle size={14} />
                    </Badge>
                )}
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    {metricLabel}: <span className="font-medium text-foreground">{metricValue}</span>
                </p>
                <button
                    onClick={onAction}
                    className="flex w-full items-center justify-between text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                    <span>{actionText}</span>
                    <ArrowRight size={16} />
                </button>
            </CardContent>
        </Card>
    );
}
