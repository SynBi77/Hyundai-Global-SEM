import { Campaign, AdGroup } from "./types";

export const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: "1",
        name: "KR_Search_Brand_Genesis",
        status: "ENABLED",
        advertisingChannelType: "SEARCH",
        biddingStrategyType: "TARGET_IMPRESSION_SHARE",
        budget: 5000000,
        metrics: {
            impressions: 15000,
            clicks: 3000,
            costMicros: 4500000000,
            searchLostIsRank: 0.05,
        },
    },
    {
        id: "2",
        name: "KR_Search_Generic_SUV",
        status: "ENABLED",
        advertisingChannelType: "SEARCH",
        biddingStrategyType: "MAXIMIZE_CONVERSIONS",
        budget: 3000000,
        metrics: {
            impressions: 45000,
            clicks: 1200,
            costMicros: 2800000000,
            searchLostIsRank: 0.25,
        },
    },
    {
        id: "3",
        name: "KR_Search_Competitor_Kia",
        status: "ENABLED",
        advertisingChannelType: "SEARCH",
        biddingStrategyType: "MANUAL_CPC",
        budget: 1000000,
        metrics: {
            impressions: 5000,
            clicks: 200,
            costMicros: 800000000,
            searchLostIsRank: 0.6,
        },
    },
    {
        id: "4",
        name: "US_Search_Brand_Sonata", // Non-compliant name? "US_Search_Brand" is compliant based on logic "contains _Brand"
        status: "ENABLED",
        advertisingChannelType: "SEARCH",
        biddingStrategyType: "TARGET_ROAS",
        budget: 2000000,
        metrics: {
            impressions: 12000,
            clicks: 2500,
            costMicros: 3000000000,
            searchLostIsRank: 0.02,
        },
    },
    {
        id: "5",
        name: "KR_Display_Retargeting", // Should be ignored by Gatekeeper (Display)
        status: "ENABLED",
        advertisingChannelType: "DISPLAY",
        biddingStrategyType: "TARGET_CPA",
        budget: 1500000,
        metrics: {
            impressions: 100000,
            clicks: 500,
            costMicros: 1200000000,
            searchLostIsRank: 0,
        },
    },
    {
        id: "6",
        name: "Bad_Campaign_Name_Example", // Non-compliant
        status: "ENABLED",
        advertisingChannelType: "SEARCH",
        biddingStrategyType: "MANUAL_CPC",
        budget: 500000,
        metrics: {
            impressions: 2000,
            clicks: 50,
            costMicros: 400000000,
            searchLostIsRank: 0.8,
        },
    },
];

export const MOCK_ADGROUPS: AdGroup[] = [
    {
        id: "101",
        name: "Genesis_Sedan_Exact",
        campaignId: "1",
        status: "ENABLED",
        type: "SEARCH_STANDARD",
        adStrength: "EXCELLENT",
        metrics: { impressions: 10000 },
    },
    {
        id: "102",
        name: "Genesis_SUV_Broad",
        campaignId: "1",
        status: "ENABLED",
        type: "SEARCH_STANDARD",
        adStrength: "GOOD",
        metrics: { impressions: 5000 },
    },
    {
        id: "201",
        name: "SantaFe_General",
        campaignId: "2",
        status: "ENABLED",
        type: "SEARCH_STANDARD",
        adStrength: "AVERAGE",
        metrics: { impressions: 30000 },
    },
    {
        id: "202",
        name: "Tucson_Promo",
        campaignId: "2",
        status: "ENABLED",
        type: "SEARCH_STANDARD",
        adStrength: "POOR",
        metrics: { impressions: 15000 },
    },
];
