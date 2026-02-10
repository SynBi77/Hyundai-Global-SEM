"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
    calculateGatekeeperScore,
    calculateCoverageScore,
    calculateQualityScore,
    calculateAIScore,
} from "@/lib/kpiLogic";
import { GatekeeperBadge } from "@/components/GatekeeperBadge";
import { MetricCard } from "@/components/MetricCard";
import { BottomNav } from "@/components/BottomNav";
import { ActionCard } from "@/components/ActionCard";
import { PriorityTable } from "@/components/PriorityTable";
import { DataScoreInput } from "@/components/DataScoreInput";
import { AccountSelector } from "@/components/AccountSelector";
import { Campaign, AdGroup, KPIResult } from "@/lib/types";
import { ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function Dashboard() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    // Account State
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    // Data State
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [adGroups, setAdGroups] = useState<AdGroup[]>([]);

    // KPI State
    const [gatekeeper, setGatekeeper] = useState<KPIResult>({ score: 0, status: "FAIL" });
    const [coverage, setCoverage] = useState<KPIResult>({ score: 0, status: "FAIL" });
    const [quality, setQuality] = useState<KPIResult>({ score: 0, status: "FAIL" });
    const [ai, setAI] = useState<KPIResult>({ score: 0, status: "FAIL" });
    const [data, setData] = useState<KPIResult>({ score: 0, status: "FAIL" });

    // Fetch Data
    useEffect(() => {
        async function fetchData() {
            if (!session || !selectedAccountId) return;

            try {
                setLoading(true);
                // Pass selectedAccountId to API
                const res = await fetch(`/api/google-ads/campaigns?customerId=${selectedAccountId}`);

                if (!res.ok) throw new Error("Failed to fetch");

                const json = await res.json();

                // If API returns empty or error, falling back to empty arrays
                const fetchedCampaigns = json.campaigns || [];
                const fetchedAdGroups = json.adGroups || [];

                setCampaigns(fetchedCampaigns);
                setAdGroups(fetchedAdGroups);

                // Calculate Scores immediately with real data
                setGatekeeper(calculateGatekeeperScore(fetchedCampaigns));
                setCoverage(calculateCoverageScore(fetchedCampaigns));
                setQuality(calculateQualityScore(fetchedAdGroups));
                setAI(calculateAIScore(fetchedCampaigns));

            } catch (error) {
                console.error("Error loading dashboard data:", error);
                // Optional: set null state or show error
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [session, selectedAccountId]);

    // Use Mock data only if no session (demo mode) or if explicitly requested to keep mock fallback?
    // For this task, we want REAL data. If not logged in, it shows empty or 0.
    // If we want a "Demo Mode" when not logged in, we could keep the old logic for !session.
    // Let's stick to: Not logged in -> Login prompt. Logged in -> Real Data.
    useEffect(() => {
        if (!session) {
            // Reset or keep 0
            setGatekeeper({ score: 0, status: "FAIL" });
            setCoverage({ score: 0, status: "FAIL" });
            setQuality({ score: 0, status: "FAIL" });
            setAI({ score: 0, status: "FAIL" });
        }
    }, [session]);

    const showCoverage = gatekeeper.status === "PASS";

    // --- Filter Data for Action Tables ---

    // 1. Coverage Actions: High Lost IS (Rank)
    const coverageActions = campaigns.filter(
        (c) =>
            c.status === "ENABLED" &&
            c.advertisingChannelType === "SEARCH" &&
            c.metrics.searchLostIsRank > 0.05 // > 5% as a threshold
    ).sort((a, b) => b.metrics.searchLostIsRank - a.metrics.searchLostIsRank);

    // 2. Quality Actions: Low Ad Strength
    const qualityActions = adGroups.filter(
        (ag) =>
            ag.status === "ENABLED" &&
            (ag.adStrength === "POOR" || ag.adStrength === "AVERAGE" || ag.adStrength === "UNKNOWN")
    ).sort((a, b) => b.metrics.impressions - a.metrics.impressions);

    // 3. AI Actions: Manual CPC / Legacy Bidding
    const aiActions = campaigns.filter(
        (c) =>
            (c.biddingStrategyType === "MANUAL_CPC" || c.biddingStrategyType === "TARGET_IMPRESSION_SHARE") &&
            c.status === "ENABLED"
    ).sort((a, b) => b.metrics.costMicros - a.metrics.costMicros);

    return (
        <main className="min-h-screen bg-gray-50 pb-20 dark:bg-black">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-white/80 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Global SEM Lite
                        </h1>
                        {session && (
                            <AccountSelector
                                onSelect={setSelectedAccountId}
                                selectedId={selectedAccountId || undefined}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {session ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {session.user?.email}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm font-medium text-red-600 hover:underline"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("google")}
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                Login with Google
                            </button>
                        )}
                        <GatekeeperBadge score={gatekeeper.score} threshold={90} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {showCoverage ? (
                        <MetricCard
                            title="Coverage (C-1)"
                            score={coverage.score}
                            status={coverage.status}
                            description="Measures if you are losing brand search traffic to competitors due to low Ad Rank. Aim for <10% loss."
                        />
                    ) : (
                        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
                            <p className="text-sm font-medium text-zinc-500">
                                Coverage Score Hidden
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                                Fix Naming Rules (D-3) to unlock.
                            </p>
                        </div>
                    )}

                    <MetricCard
                        title="Quality (Q-2)"
                        score={quality.score}
                        status={quality.status}
                        description="Assesses if your ads have enough assets (Headlines/Descriptions) for Google's AI to optimize performance."
                    />

                    <MetricCard
                        title="AI Adoption (A-2)"
                        score={ai.score}
                        status={ai.status}
                        description="Tracks the shift from Manual Bidding (Level 0) to AI-driven Value Bidding (Level 2)."
                    />

                    <MetricCard
                        title="Data (D-1/D-2)"
                        score={data.score}
                        status={data.status}
                        description="Self-assessment of GA4 and 1st Party Data implementation."
                    />
                </div>

                {/* Data Input Section */}
                <section>
                    <DataScoreInput onScoreChange={(score) =>
                        // Update Data KPI State
                        setData(prev => ({
                            ...prev,
                            score: score,
                            status: score >= 60 ? "PASS" : "FAIL"
                        }))
                    } />
                </section>

                {/* Priority Actions Sections */}
                <div className="space-y-8">

                    {/* 1. Coverage Optimization Priorities */}
                    {showCoverage && coverageActions.length > 0 && (
                        <section>
                            <div className="mb-4 flex items-center gap-2">
                                <ShieldCheck className="text-blue-600" size={20} />
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Coverage Priorities
                                </h2>
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <PriorityTable
                                    data={coverageActions}
                                    columns={[
                                        { header: "Campaign Name", accessorKey: "name" },
                                        {
                                            header: "Lost IS (Rank)",
                                            accessorKey: (item) => (
                                                <span className="font-semibold text-red-600">
                                                    {(item.metrics.searchLostIsRank * 100).toFixed(1)}%
                                                </span>
                                            )
                                        },
                                        {
                                            header: "Action",
                                            accessorKey: () => (
                                                <span className="font-medium text-blue-600">
                                                    Increase Bid / Improve Quality
                                                </span>
                                            ),
                                        },
                                    ]}
                                />
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {coverageActions.map(c => (
                                    <ActionCard
                                        key={c.id}
                                        title={c.name}
                                        metricLabel="Lost IS (Rank)"
                                        metricValue={`${(c.metrics.searchLostIsRank * 100).toFixed(1)}%`}
                                        actionText="Fix Coverage"
                                        severity="high"
                                    />
                                ))}
                            </div>
                        </section>
                    )}


                    {/* 2. Quality Excellence Priorities */}
                    {qualityActions.length > 0 && (
                        <section>
                            <div className="mb-4 flex items-center gap-2">
                                <Zap className="text-amber-500" size={20} />
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Quality Priorities
                                </h2>
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <PriorityTable
                                    data={qualityActions}
                                    columns={[
                                        { header: "Ad Group Name", accessorKey: "name" },
                                        {
                                            header: "Ad Strength",
                                            accessorKey: (item) => (
                                                <span className={item.adStrength === "POOR" ? "text-red-600 font-bold" : "text-amber-600 font-medium"}>
                                                    {item.adStrength}
                                                </span>
                                            )
                                        },
                                        { header: "Impressions", accessorKey: (item) => item.metrics.impressions.toLocaleString() },
                                        {
                                            header: "Action",
                                            accessorKey: () => (
                                                <span className="font-medium text-amber-600">
                                                    Add Assets / Pin Less
                                                </span>
                                            ),
                                        },
                                    ]}
                                />
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {qualityActions.map(ag => (
                                    <ActionCard
                                        key={ag.id}
                                        title={ag.name}
                                        metricLabel="Ad Strength"
                                        metricValue={ag.adStrength}
                                        actionText="Improve Assets"
                                        severity="medium"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 3. AI Adoption Priorities */}
                    {aiActions.length > 0 && (
                        <section>
                            <div className="mb-4 flex items-center gap-2">
                                <BarChart3 className="text-purple-600" size={20} />
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    AI Adoption Priorities
                                </h2>
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <PriorityTable
                                    data={aiActions}
                                    columns={[
                                        { header: "Campaign Name", accessorKey: "name" },
                                        {
                                            header: "Strategy",
                                            accessorKey: "biddingStrategyType",
                                            className: "text-zinc-500 text-xs"
                                        },
                                        {
                                            header: "Cost",
                                            accessorKey: (item: Campaign) =>
                                                `₩${(item.metrics.costMicros / 1000000).toLocaleString()}`,
                                        },
                                        {
                                            header: "Action",
                                            accessorKey: () => (
                                                <span className="font-medium text-purple-600">
                                                    Switch to Value Bidding
                                                </span>
                                            ),
                                        },
                                    ]}
                                />
                            </div>

                            {/* Mobile Cards */}
                            <div className="space-y-3 md:hidden">
                                {aiActions.map((c) => (
                                    <ActionCard
                                        key={c.id}
                                        title={c.name}
                                        metricLabel="Cost"
                                        metricValue={`₩${(c.metrics.costMicros / 1000000).toLocaleString()}`}
                                        actionText="Switch to Value Bidding"
                                        severity="high"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </div>

            <BottomNav />
        </main>
    );
}
