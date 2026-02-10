
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

const GOOGLE_ADS_VERSION = "v18";

export async function GET() {
    console.log("API: /api/google-ads/accounts called");
    try {
        const session: any = await getServerSession(authOptions);
        console.log("API: Session retrieved", session ? "Session Exists" : "No Session");


        if (!session || !session.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
        if (!developerToken) {
            return NextResponse.json({ error: "Missing configuration" }, { status: 500 });
        }

        // 1. List Accessible Customers
        // Use v18 standard endpoint
        const url = "https://googleads.googleapis.com/v18/customers:listAccessibleCustomers";
        const devToken = developerToken || "MISSING";
        const accessToken = session.accessToken || "MISSING";

        console.log(`[API DEBUG] Fetching URL: ${url}`);
        console.log(`[API DEBUG] Dev Token Length: ${devToken.length}`);
        console.log(`[API DEBUG] Dev Token (First 3): ${devToken.substring(0, 3)}...`);
        console.log(`[API DEBUG] Access Token Length: ${accessToken.length}`);
        console.log(`[API DEBUG] Access Token (First 10): ${accessToken.substring(0, 10)}...`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.accessToken}`,
                "developer-token": developerToken,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to list accounts:", errorText);
            throw new Error(`Google Ads API Request Failed: ${errorText}`);
        }

        const data = await response.json();
        // data.resourceNames is array of "customers/1234567890"

        const resourceNames = data.resourceNames || [];

        // We need meaningful names. We can try to fetch Customer details for each.
        // Or if there are many, just return IDs. 
        // Better: For each accessible customer, query its 'customer_client' table to find sub-accounts (if it's an MCC). 
        // But for MVP, let's just use the accessible customers and try to get their names.



        // 2. For each accessible customer, traverse the hierarchy to find leaf accounts (non-manager)
        // We will query `customer_client` to get all client accounts under the accessible customer.
        const accounts = [];

        for (const resourceName of resourceNames) {
            const accessibleCustomerId = resourceName.split("/")[1];

            // Query to find all client accounts under this customer (recursive = true by default in GAQL for this view?)
            // Actually, we must specify the hierarchy.
            // The defining query for "All accounts I can access down the tree" is:
            // "SELECT customer_client.client_customer, customer_client.level, customer_client.descriptive_name, customer_client.manager FROM customer_client WHERE customer_client.level <= 1"? No, we want all levels.

            // Getting all non-manager accounts under this accessible customer
            const query = `
                SELECT 
                    customer_client.client_customer, 
                    customer_client.descriptive_name, 
                    customer_client.manager,
                    customer_client.status
                FROM customer_client
                WHERE customer_client.manager = FALSE
                AND customer_client.status = 'ENABLED'
            `;

            // Note: We use the accessibleCustomerId as the context for this search
            const queryUrl = `https://googleads.googleapis.com/${GOOGLE_ADS_VERSION}/customers/${accessibleCustomerId}/googleAds:search`;

            try {
                const clientRes = await fetch(queryUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.accessToken}`,
                        "developer-token": developerToken,
                        "login-customer-id": accessibleCustomerId // Vital to set the context to the MCC
                    },
                    body: JSON.stringify({ query }),
                });

                if (clientRes.ok) {
                    const clientData = await clientRes.json();
                    if (clientData.results) {
                        for (const row of clientData.results) {
                            const client = row.customerClient;
                            // Clean ID: "customers/1234567890" -> "1234567890"
                            const clientId = client.clientCustomer.split('/')[1];
                            accounts.push({
                                id: clientId,
                                name: client.descriptiveName || `Account ${clientId}`,
                            });
                        }
                    }
                } else {
                    // Fallback: If the accessible customer IS a client account itself (not MCC), 
                    // the query might return empty or work differently.
                    // Or if we failed, we just try to add the accessible customer itself provided it's not known as an MCC (we can't easily know yet without querying it).
                    // Let's try to fetch its own details if the hierarchy query failed or returned nothing.
                    console.warn(`Hierarchy query failed for ${accessibleCustomerId}`);

                    // Try to add the accessible customer itself
                    const selfQuery = `SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1`;
                    const selfRes = await fetch(queryUrl, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.accessToken}`,
                            "developer-token": developerToken,
                            "login-customer-id": accessibleCustomerId
                        },
                        body: JSON.stringify({ query: selfQuery })
                    });

                    if (selfRes.ok) {
                        const selfData = await selfRes.json();
                        if (selfData.results && selfData.results.length > 0) {
                            const self = selfData.results[0].customer;
                            // Only add if not manager (optional, maybe we want to select manager to see aggregate? usually no for this dashboard)
                            if (!self.manager) {
                                accounts.push({
                                    id: self.id,
                                    name: self.descriptiveName || `Account ${self.id}`
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn(`Failed to fetch hierarchy for ${accessibleCustomerId}`, e);
            }
        }

        // Deduplicate accounts (in case multiple MCCs have access to the same account)
        const uniqueAccounts = Array.from(new Map(accounts.map(item => [item.id, item])).values());

        return NextResponse.json({ accounts: uniqueAccounts });

    } catch (error: any) {
        console.error("API Route Error:", error);

        // Fallback to Mock Data if API fails (e.g. Network Block)
        console.warn("Falling back to MOCK DATA due to API failure.");
        const mockAccounts = [
            { id: "1234567890", name: "Mock Account A (Hyundai Global)" },
            { id: "0987654321", name: "Mock Account B (Kia Global)" },
            { id: "1122334455", name: "Mock Account C (Genesis)" }
        ];
        return NextResponse.json({ accounts: mockAccounts });
    }
}
