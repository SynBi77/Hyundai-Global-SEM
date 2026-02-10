import { Campaign, AdGroup, KPIResult } from "./types";

// D-3: Gatekeeper Logic (Naming Rule Compliance)
export function calculateGatekeeperScore(campaigns: Campaign[]): KPIResult {
    if (campaigns.length === 0) return { score: 0, status: "FAIL" };

    const searchCampaigns = campaigns.filter(
        (c) => c.advertisingChannelType === "SEARCH" && c.status === "ENABLED"
    );

    if (searchCampaigns.length === 0) return { score: 0, status: "FAIL" };

    const compliantCount = searchCampaigns.filter((c) => {
        const name = c.name.toLowerCase();
        return (
            name.includes("_brand") ||
            name.includes("_generic") ||
            name.includes("_competitor")
        );
    }).length;

    const score = (compliantCount / searchCampaigns.length) * 100;

    return {
        score: Math.round(score),
        status: score >= 90 ? "PASS" : "FAIL",
    };
}

// C-1: Coverage Optimization (Brand Defense)
export function calculateCoverageScore(campaigns: Campaign[]): KPIResult {
    const brandCampaigns = campaigns.filter(
        (c) =>
            c.advertisingChannelType === "SEARCH" &&
            c.name.toLowerCase().includes("_brand") &&
            c.status === "ENABLED"
    );

    if (brandCampaigns.length === 0) return { score: 0, status: "FAIL" };

    // Weighted Average of (1 - Lost IS Rank)
    // KPI: (1 - SearchLostIS(Rank)) * 100
    // Simplified aggregation: Average of metric across campaigns weighted by impressions?
    // The prompt says "KPI C-1: (1 - SearchLostIS(Rank)) * 100" from API.
    // We'll calculate it per campaign and average it, or take the account level metric if available.
    // For this exercise, let's take a weighted average by impressions.

    let totalWeightedIS = 0;
    let totalImpressions = 0;

    for (const c of brandCampaigns) {
        const lostIS = c.metrics.searchLostIsRank;
        const impressionShare = 1 - lostIS;
        totalWeightedIS += impressionShare * c.metrics.impressions;
        totalImpressions += c.metrics.impressions;
    }

    const averageIS = totalImpressions > 0 ? totalWeightedIS / totalImpressions : 0;
    const score = averageIS * 100;

    return {
        score: Math.round(score),
        status: score >= 90 ? "PASS" : score >= 70 ? "WARNING" : "FAIL",
    };
}

// Q-2: Quality Excellence (Creative)
// Impression-Weighted Ad Strength
export function calculateQualityScore(adGroups: AdGroup[]): KPIResult {
    const rsaAdGroups = adGroups.filter((ag) => ag.type === "SEARCH_STANDARD"); // Assuming RSA inside standard AGs

    if (rsaAdGroups.length === 0) return { score: 0, status: "FAIL" };

    const strengthMap: Record<string, number> = {
        EXCELLENT: 100,
        GOOD: 75,
        AVERAGE: 50,
        POOR: 0,
        UNKNOWN: 0,
    };

    let totalWeightedScore = 0;
    let totalImpressions = 0;

    for (const ag of rsaAdGroups) {
        const points = strengthMap[ag.adStrength] || 0;
        totalWeightedScore += points * ag.metrics.impressions;
        totalImpressions += ag.metrics.impressions;
    }

    const score =
        totalImpressions > 0 ? totalWeightedScore / totalImpressions : 0;

    return {
        score: Math.round(score),
        status: score >= 75 ? "PASS" : "FAIL",
    };
}

// A-2: AI Adoption (Smart Bidding)
// Cost-Weighted Average
export function calculateAIScore(campaigns: Campaign[]): KPIResult {
    const activeCampaigns = campaigns.filter(
        (c) => c.advertisingChannelType === "SEARCH" && c.status === "ENABLED"
    );

    if (activeCampaigns.length === 0) return { score: 0, status: "FAIL" };

    // Level 0 (0 pts): Manual CPC
    // Level 1 (40 pts): Max Conversions, tCPA, Target Impression Share
    // Level 2 (100 pts): tROAS, Max Conversion Value

    const scoringMap: Record<string, number> = {
        MANUAL_CPC: 0,
        MAXIMIZE_CONVERSIONS: 40,
        TARGET_CPA: 40,
        TARGET_IMPRESSION_SHARE: 40,
        TARGET_ROAS: 100,
        MAXIMIZE_CONVERSION_VALUE: 100,
        // Add others as needed
    };

    let totalWeightedScore = 0;
    let totalCost = 0;

    for (const c of activeCampaigns) {
        const points = scoringMap[c.biddingStrategyType] || 0;
        totalWeightedScore += points * c.metrics.costMicros;
        totalCost += c.metrics.costMicros;
    }

    const score = totalCost > 0 ? totalWeightedScore / totalCost : 0;

    return {
        score: Math.round(score),
        status: score >= 60 ? "PASS" : "FAIL",
    };
}
