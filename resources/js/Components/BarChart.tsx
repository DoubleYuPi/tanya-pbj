interface DataPoint {
    month: string;
    total: number;
}

// Deliberately a small inline-SVG chart rather than pulling in a charting
// library — the spec's charts are simple monthly counts, and this keeps
// the frontend bundle lean with no extra dependency to maintain.
export default function BarChart({ data, color = 'var(--color-primary)' }: { data: DataPoint[]; color?: string }) {
    const max = Math.max(...data.map((d) => d.total), 1);

    return (
        <div className="flex h-48 items-end gap-2" role="img" aria-label="Grafik batang jumlah per bulan">
            {data.map((d) => (
                <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{d.total}</span>
                    <div
                        className="w-full rounded-t"
                        style={{
                            height: `${Math.max((d.total / max) * 100, 2)}%`,
                            backgroundColor: color,
                        }}
                    />
                    <span className="text-[10px] text-[var(--color-muted-foreground)]">{d.month}</span>
                </div>
            ))}
        </div>
    );
}
