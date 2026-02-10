
"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Account {
    id: string;
    name: string;
}

interface AccountSelectorProps {
    onSelect: (accountId: string) => void;
    selectedId?: string;
}

export function AccountSelector({ onSelect, selectedId }: AccountSelectorProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function fetchAccounts() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/google-ads/accounts");
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    const errorMessage = errorData.error || res.statusText;
                    throw new Error(errorMessage);
                }
                const data = await res.json();

                if (mounted) {
                    const loadedAccounts = data.accounts || [];
                    setAccounts(loadedAccounts);

                    if (loadedAccounts.length === 0) {
                        setError("No Google Ads accounts found.");
                    } else if (!selectedId && loadedAccounts.length > 0) {
                        // Auto-select first if none selected
                        // Use a timeout to ensure state updates don't conflict or loop immediately if parent re-renders cause fetch
                        // minimal risk here since dependency is []
                        onSelect(loadedAccounts[0].id);
                    }
                }
            } catch (err: any) {
                if (mounted) {
                    console.error("Account fetch error:", err);
                    setError(err.message || "Failed to load accounts");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchAccounts();

        return () => {
            mounted = false;
        };
    }, []); // Run only once on mount

    return (
        <div className="relative inline-block text-left w-[250px]">
            <select
                className={cn(
                    "block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-black dark:border-zinc-800",
                    error ? "border-red-300 text-red-900" : ""
                )}
                value={selectedId || ""}
                onChange={(e) => onSelect(e.target.value)}
                disabled={loading || accounts.length === 0 || !!error}
            >
                {loading ? (
                    <option>Loading accounts...</option>
                ) : error ? (
                    <option disabled>{error}</option>
                ) : accounts.length === 0 ? (
                    <option>No accounts found</option>
                ) : (
                    accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.id})
                        </option>
                    ))
                )}
            </select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
