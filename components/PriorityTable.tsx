import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
    header: string;
    accessorKey: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface PriorityTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
}

export function PriorityTable<T>({
    data,
    columns,
    onRowClick,
}: PriorityTableProps<T>) {
    return (
        <div className="rounded-md border bg-white dark:border-zinc-800 dark:bg-zinc-900 hidden md:block">
            <Table>
                <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                    <TableRow>
                        {columns.map((col, i) => (
                            <TableHead
                                key={i}
                                className={cn(
                                    "font-medium text-zinc-500 dark:text-zinc-400",
                                    col.className
                                )}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, rowIndex) => (
                        <TableRow
                            key={rowIndex}
                            onClick={() => onRowClick?.(item)}
                            className="group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                            {columns.map((col, colIndex) => (
                                <TableCell key={colIndex}>
                                    {typeof col.accessorKey === "function"
                                        ? col.accessorKey(item)
                                        : (item[col.accessorKey] as React.ReactNode)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
