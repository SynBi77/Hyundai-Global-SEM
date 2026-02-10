"use client";

import { BottomNav } from "@/components/BottomNav";
import { ActionCard } from "@/components/ActionCard";
import { PriorityTable } from "@/components/PriorityTable";
import { MOCK_CAMPAIGNS } from "@/lib/mockData";
import { ShieldCheck } from "lucide-react";

export default function CoveragePage() {
    // Filter for coverage issues: High Search Lost IS (Rank)
    const coverageIssues = MOCK_CAMPAIGNS.filter(
        (c) =>
            c.status === "ENABLED" &&
            c.advertisingChannelType === "SEARCH" &&
            c.metrics.searchLostIsRank > 0.1 // > 10% lost due to rank
    ).sort((a, b) => b.metrics.searchLostIsRank - a.metrics.searchLostIsRank);

    return (
        <main className="min-h-screen bg-gray-50 pb-20 dark:bg-black">
            <header className="sticky top-0 z-40 border-b bg-white/80 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
                <div className="mx-auto flex max-w-5xl items-center gap-2">
                    <ShieldCheck className="text-blue-600" />
                    <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Coverage Optimization
                    </h1>
                </div>
            </header>

            <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
                <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Goal:</strong> Reduce Lost Impression Share (Rank) to under
                        10% for Brand campaigns.
                    </p>
                </div>

                <section>
                    <h2 className="mb-4 text-lg font-semibold">Priority Fixes</h2>

                    {/* Mobile Cards */}
                    <div className="space-y-3 md:hidden">
                        {coverageIssues.map((c) => (
                            <ActionCard
                                key={c.id}
                                title={c.name}
                                metricLabel="Lost IS (Rank)"
                                metricValue={`${(c.metrics.searchLostIsRank * 100).toFixed(1)}%`}
                                actionText="Increase Bid / Quality"
                                severity="high"
                            />
                        ))}
                        {coverageIssues.length === 0 && (
                            <p className="text-zinc-500">No critical coverage issues found.</p>
                        )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <PriorityTable
                            data={coverageIssues}
                            columns={[
                                { header: "Campaign Name", accessorKey: "name" },
                                {
                                    header: "Lost IS (Rank)",
                                    accessorKey: (item) => (
                                        <span className="font-semibold text-red-600">
                                            {(item.metrics.searchLostIsRank * 100).toFixed(1)}%
                                        </span>
                                    ),
                                },
                                {
                                    header: "Impressions",
                                    accessorKey: (item) => item.metrics.impressions.toLocaleString(),
                                },
                                {
                                    header: "Action",
                                    accessorKey: () => (
                                        <span className="font-medium text-blue-600">
                                            Increase Bid / Improve Quality Score
                                        </span>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </section>
            </div>

            <BottomNav />
        </main>
    );
}
