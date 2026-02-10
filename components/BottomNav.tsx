"use client";

import { Home, ShieldCheck, Zap, Database, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Overview", href: "/", icon: Home },
    { name: "Coverage", href: "/coverage", icon: ShieldCheck },
    { name: "Quality", href: "/quality", icon: Zap },
    { name: "AI", href: "/ai", icon: BarChart3 },
    { name: "Data", href: "/data", icon: Database },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-white pb-safe dark:bg-zinc-900 md:hidden">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-1 p-2 text-xs",
                                isActive
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                            )}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
