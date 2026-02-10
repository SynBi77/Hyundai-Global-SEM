export interface Campaign {
    id: string;
    name: string;
    status: string;
    advertisingChannelType: string;
    biddingStrategyType: string;
    budget: number;
    metrics: {
        impressions: number;
        clicks: number;
        costMicros: number;
        searchLostIsRank: number; // 0-1 range
    };
}

export interface AdGroup {
    id: string;
    name: string;
    campaignId: string;
    status: string;
    type: string;
    adStrength: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" | "UNKNOWN";
    metrics: {
        impressions: number;
    };
}

export interface KPIResult {
    score: number; // 0-100
    status: "PASS" | "FAIL" | "WARNING";
    details?: any;
}

export interface MaturityScores {
    gatekeeper: KPIResult; // D-3
    coverage: KPIResult;   // C-1
    quality: KPIResult;    // Q-2
    ai: KPIResult;         // A-2
    data: KPIResult;       // D-1 & D-2 (Manual)
}
