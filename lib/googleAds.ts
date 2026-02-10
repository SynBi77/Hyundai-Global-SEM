
import { Campaign, AdGroup } from "./types";

const GOOGLE_ADS_VERSION = "v18";

interface GoogleAdsConfig {
    accessToken: string;
    customerId: string;
    developerToken: string;
}

/**
 * Executes a GAQL query against the Google Ads API.
 */
export async function fetchGoogleAdsData(
    config: GoogleAdsConfig,
    query: string
): Promise<any[]> {
    const { accessToken, customerId, developerToken } = config;

    if (!accessToken || !customerId || !developerToken) {
        console.error("Missing Google Ads credentials");
        throw new Error("Missing Google Ads credentials");
    }

    // Remove ensure numeric customer ID
    const cleanCustomerId = customerId.replace(/-/g, "");

    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_VERSION}/customers/${cleanCustomerId}/googleAds:search`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                "developer-token": developerToken,
            },
            body: JSON.stringify({
                query,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Google Ads API Error (${response.status}) for ${url}:`, errorText);
            throw new Error(`Google Ads API Request Failed: ${errorText}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error fetching Google Ads data:", error);
        throw error;
    }
}
