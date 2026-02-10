"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataScoreInputProps {
    onScoreChange: (score: number) => void;
}

const GA4_LEVELS = [
    { level: 0, label: "Not Implemented", points: 0 },
    { level: 1, label: "Basic Implementation", points: 40 },
    { level: 2, label: "Advanced (eCommerce/Events)", points: 70 },
    { level: 3, label: "Primary Bid Source (Activated)", points: 100 },
];

const DATA_LEVELS = [
    { level: 0, label: "Not Used", points: 0 },
    { level: 1, label: "Customer Match (List Upload)", points: 40 },
    { level: 2, label: "Enhanced Conversions", points: 70 },
    { level: 3, label: "CDP / API Integration", points: 100 },
];

export function DataScoreInput({ onScoreChange }: DataScoreInputProps) {
    const [ga4Level, setGa4Level] = useState<number>(0);
    const [dataLevel, setDataLevel] = useState<number>(0);

    const updateScore = (newGa4Level: number, newDataLevel: number) => {
        const ga4Points = GA4_LEVELS.find((l) => l.level === newGa4Level)?.points || 0;
        const dataPoints = DATA_LEVELS.find((l) => l.level === newDataLevel)?.points || 0;
        const totalScore = Math.round((ga4Points + dataPoints) / 2);
        onScoreChange(totalScore);
    };

    const handleGa4Change = (level: number) => {
        setGa4Level(level);
        updateScore(level, dataLevel);
    };

    const handleDataChange = (level: number) => {
        setDataLevel(level);
        updateScore(ga4Level, level);
    };

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Data Maturity Assessment (Manual Input)
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
                {/* D-1: GA4 Checklist */}
                <div>
                    <h4 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        D-1: GA4 Implementation
                    </h4>
                    <div className="space-y-2">
                        {GA4_LEVELS.map((item) => (
                            <button
                                key={item.level}
                                onClick={() => handleGa4Change(item.level)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all",
                                    ga4Level === item.level
                                        ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {ga4Level === item.level ? (
                                        <CheckCircle2 className="text-blue-500" size={20} />
                                    ) : (
                                        <Circle className="text-zinc-300" size={20} />
                                    )}
                                    <span
                                        className={cn(
                                            "text-sm",
                                            ga4Level === item.level
                                                ? "font-medium text-blue-900 dark:text-blue-100"
                                                : "text-zinc-600 dark:text-zinc-400"
                                        )}
                                    >
                                        Level {item.level}: {item.label}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-zinc-400">
                                    {item.points} pts
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* D-2: 1st Party Data Checklist */}
                <div>
                    <h4 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        D-2: 1st Party Data Usage
                    </h4>
                    <div className="space-y-2">
                        {DATA_LEVELS.map((item) => (
                            <button
                                key={item.level}
                                onClick={() => handleDataChange(item.level)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all",
                                    dataLevel === item.level
                                        ? "border-purple-500 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20"
                                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {dataLevel === item.level ? (
                                        <CheckCircle2 className="text-purple-500" size={20} />
                                    ) : (
                                        <Circle className="text-zinc-300" size={20} />
                                    )}
                                    <span
                                        className={cn(
                                            "text-sm",
                                            dataLevel === item.level
                                                ? "font-medium text-purple-900 dark:text-purple-100"
                                                : "text-zinc-600 dark:text-zinc-400"
                                        )}
                                    >
                                        Level {item.level}: {item.label}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-zinc-400">
                                    {item.points} pts
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
