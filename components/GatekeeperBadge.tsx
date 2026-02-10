
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface GatekeeperBadgeProps {
    score: number;
    threshold?: number;
}

export function GatekeeperBadge({ score, threshold = 90 }: GatekeeperBadgeProps) {
    const isPass = score >= threshold;

    return (
        <Badge
            variant={isPass ? "success" : "destructive"}
            className="flex items-center gap-2 px-3 py-1"
        >
            {isPass ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            <span>Integrity: {score}%</span>
        </Badge>
    );
}
