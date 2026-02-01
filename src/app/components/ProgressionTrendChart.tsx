import { memo, useMemo, type CSSProperties } from "react";

type Point = { x: number; y: number };

type ProgressionTrendChartProps = {
    labels: string[];
    xpSeries: number[];
    goldSeries: number[];
    formatNumber: (value: number) => string;
    hoverIndex: number | null;
    onHoverIndexChange: (value: number | null) => void;
};

const buildPoints = (values: number[], width: number, height: number, padding: number, maxValue: number) => {
    const max = Math.max(maxValue, 1);
    const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
    return values.map((value, index) => {
        const x = padding + step * index;
        const y = height - padding - (value / max) * (height - padding * 2);
        return { x, y };
    });
};

const pointsToPolyline = (points: Point[]) => {
    return points.map((point) => `${point.x},${point.y}`).join(" ");
};

export const ProgressionTrendChart = memo(({
    labels,
    xpSeries,
    goldSeries,
    formatNumber,
    hoverIndex,
    onHoverIndexChange
}: ProgressionTrendChartProps) => {
    const chart = useMemo(() => {
        const width = 360;
        const height = 180;
        const padding = 18;
        const maxValue = Math.max(...xpSeries, ...goldSeries, 1);
        const xpPoints = buildPoints(xpSeries, width, height, padding, maxValue);
        const goldPoints = buildPoints(goldSeries, width, height, padding, maxValue);
        return {
            width,
            height,
            maxValue,
            xpPoints,
            goldPoints
        };
    }, [xpSeries, goldSeries]);

    return (
        <>
            <div className="ts-prog-chart-canvas">
                <div className="ts-prog-chart-scale">
                    <span>Max {formatNumber(chart.maxValue)}</span>
                    <span>0</span>
                </div>
                <svg
                    viewBox={`0 0 ${chart.width} ${chart.height}`}
                    role="img"
                    aria-label="XP and gold trend"
                    onMouseLeave={() => onHoverIndexChange(null)}
                >
                    <polyline
                        points={pointsToPolyline(chart.xpPoints)}
                        fill="none"
                        className="ts-prog-line ts-prog-line--xp"
                        strokeWidth="2.5"
                    />
                    <polyline
                        points={pointsToPolyline(chart.goldPoints)}
                        fill="none"
                        className="ts-prog-line ts-prog-line--gold"
                        strokeWidth="2.5"
                    />
                    {chart.xpPoints.map((point, index) => (
                        <circle
                            key={`xp-${index}`}
                            className="ts-prog-point ts-prog-point--xp"
                            cx={point.x}
                            cy={point.y}
                            r={3}
                            onMouseEnter={() => onHoverIndexChange(index)}
                        />
                    ))}
                    {chart.goldPoints.map((point, index) => (
                        <circle
                            key={`gold-${index}`}
                            className="ts-prog-point ts-prog-point--gold"
                            cx={point.x}
                            cy={point.y}
                            r={3}
                            onMouseEnter={() => onHoverIndexChange(index)}
                        />
                    ))}
                </svg>
                {hoverIndex !== null && chart.xpPoints[hoverIndex] ? (
                    <div
                        className="ts-prog-tooltip"
                        style={{
                            left: `${(chart.xpPoints[hoverIndex].x / chart.width) * 100}%`,
                            top: `${(Math.min(
                                chart.xpPoints[hoverIndex].y,
                                chart.goldPoints[hoverIndex]?.y ?? chart.xpPoints[hoverIndex].y
                            ) / chart.height) * 100}%`
                        } as CSSProperties}
                    >
                        <span className="ts-prog-tooltip-label">{labels[hoverIndex]}</span>
                        <span>XP {formatNumber(xpSeries[hoverIndex])}</span>
                        <span>Gold {formatNumber(goldSeries[hoverIndex])}</span>
                    </div>
                ) : null}
            </div>
            <div className="ts-prog-chart-axis" aria-hidden="true">
                {labels.map((label) => (
                    <span key={label}>{label}</span>
                ))}
            </div>
        </>
    );
});

ProgressionTrendChart.displayName = "ProgressionTrendChart";
