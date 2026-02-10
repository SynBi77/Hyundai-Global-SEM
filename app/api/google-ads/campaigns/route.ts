
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { fetchGoogleAdsData } from "@/lib/googleAds";
import { Campaign, AdGroup } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryCustomerId = searchParams.get("customerId");

    const customerId = queryCustomerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    if (!customerId || !developerToken) {
        return NextResponse.json({ error: "Missing configuration or customerId" }, { status: 400 });
    }

    // CHECK FOR MOCK ACCOUNTS
    const MOCK_IDS = ["1234567890", "0987654321", "1122334455"];
    if (MOCK_IDS.includes(customerId)) {
        console.log(`API: Returning MOCK DATA for customer ${customerId}`);
        return NextResponse.json({
            campaigns: [
                {
                    id: "101",
                    name: "Global Brand Search (Mock)",
                    status: "ENABLED",
                    advertisingChannelType: "SEARCH",
                    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
                    budget: 5000000000, // 5000 units
                    metrics: {
                        impressions: 150000,
                        clicks: 3200,
                        costMicros: 4500000000, // 4500 units
                        searchLostIsRank: 0.15,
                    },
                },
                {
                    id: "102",
                    name: "EV Promotion Q1 (Mock)",
                    status: "ENABLED",
                    advertisingChannelType: "SEARCH",
                    biddingStrategyType: "TARGET_CPA",
                    budget: 8000000000,
                    metrics: {
                        impressions: 210000,
                        clicks: 5600,
                        costMicros: 7200000000,
                        searchLostIsRank: 0.08,
                    },
                },
            ],
            adGroups: [
                {
                    id: "201",
                    name: "Brand Gen (Mock)",
                    campaignId: "101",
                    status: "ENABLED",
                    type: "SEARCH_STANDARD",
                    adStrength: "EXCELLENT",
                    metrics: { impressions: 80000 },
                },
                {
                    id: "202",
                    name: "IONIQ 5 Keywords (Mock)",
                    campaignId: "102",
                    status: "ENABLED",
                    type: "SEARCH_STANDARD",
                    adStrength: "GOOD",
                    metrics: { impressions: 120000 },
                },
            ],
        });
    }

    const config = {
        accessToken: session.accessToken,
        customerId,
        developerToken,
    };

    // 1. Fetch Campaigns
    const campaignQuery = `
        SELECT 
            campaign.id, 
            campaign.name, 
            campaign.status, 
            campaign.advertising_channel_type,
            campaign.bidding_strategy_type,
            campaign_budget.amount_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.search_rank_lost_impression_share
        FROM campaign 
        WHERE campaign.status = 'ENABLED' 
        AND campaign.advertising_channel_type = 'SEARCH'
        AND segments.date DURING LAST_30_DAYS
    `;

    // 2. Fetch Ad Groups / Ads for Quality Score (Ad Strength)
    // We aggregate at Ad Group level for the dashboard, but Quality is per Ad. 
    // We'll fetch ads and take the best/average or just list them. 
    // The dashboard expects AdGroup objects with an 'adStrength'.
    // We will pick the ad strength of the ad with the most impressions in the ad group, or just the first one for simplicity.
    const adGroupQuery = `
        SELECT
            ad_group.id,
            ad_group.name,
            ad_group.campaign,
            ad_group.status,
            ad_group.type,
            ad_group_ad.ad.strength,
            metrics.impressions
        FROM ad_group_ad
        WHERE ad_group.status = 'ENABLED'
        AND campaign.status = 'ENABLED'
        AND segments.date DURING LAST_30_DAYS
    `;

    try {
        const [campaignRows, adGroupRows] = await Promise.all([
            fetchGoogleAdsData(config, campaignQuery),
            fetchGoogleAdsData(config, adGroupQuery),
        ]);

        // Transform Campaigns
        const campaigns: Campaign[] = campaignRows.map((row: any) => ({
            id: row.campaign.id.toString(),
            name: row.campaign.name,
            status: row.campaign.status,
            advertisingChannelType: row.campaign.advertising_channel_type,
            biddingStrategyType: row.campaign.bidding_strategy_type,
            budget: Number(row.campaign_budget?.amount_micros || 0),
            metrics: {
                impressions: Number(row.metrics?.impressions || 0),
                clicks: Number(row.metrics?.clicks || 0),
                costMicros: Number(row.metrics?.cost_micros || 0),
                searchLostIsRank: parseFloat(row.metrics?.search_rank_lost_impression_share) || 0,
            },
        }));

        // Transform Ad Groups
        // We might get multiple rows per ad group (one per ad). 
        // We need to deduplicate by ad_group.id, picking the one with highest impressions or just grouping.
        // For 'adStrength', the dashboard expects a single value.
        // Let's group by ad_group.id
        const adGroupMap = new Map<string, AdGroup>();

        adGroupRows.forEach((row: any) => {
            const agId = row.ad_group.id.toString();
            const currentStrength = row.ad_group_ad.ad.strength;
            const impressions = Number(row.metrics?.impressions || 0);

            if (!adGroupMap.has(agId)) {
                adGroupMap.set(agId, {
                    id: agId,
                    name: row.ad_group.name,
                    campaignId: row.ad_group.campaign.split('/')[3], // customers/123/campaigns/456 -> 456
                    status: row.ad_group.status,
                    type: row.ad_group.type,
                    adStrength: currentStrength,
                    metrics: {
                        impressions: impressions,
                    },
                });
            } else {
                // If we already have this ad group, maybe update if this ad has more impressions?
                // Or just aggregate impressions?
                const existing = adGroupMap.get(agId)!;
                existing.metrics.impressions += impressions;
                // Keep the strength of the highest impression ad? 
                // For simplicity, we just keep the first one encountered or maybe the 'best' one?
                // Let's just sum impressions for now.
            }
        });

        const adGroups = Array.from(adGroupMap.values());

        return NextResponse.json({ campaigns, adGroups });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
