import { memo } from "react";

type StatsViewIconProps = {
    className?: string;
};

export const GlobalProgressIcon = memo(({ className }: StatsViewIconProps) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 2.07A8.03 8.03 0 0 0 6.1 8H11V4.07Zm0 5.93H5.07a8 8 0 0 0 0 4H11v-4Zm0 6H6.1A8.03 8.03 0 0 0 11 19.93V16Zm2 3.93A8.03 8.03 0 0 0 17.9 16H13v3.93Zm0-5.93h5.93a8 8 0 0 0 0-4H13v4Zm0-6h4.9A8.03 8.03 0 0 0 13 4.07V8Z"
            fill="currentColor"
        />
    </svg>
));

GlobalProgressIcon.displayName = "GlobalProgressIcon";

export const HeroProgressIcon = memo(({ className }: StatsViewIconProps) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M12 12a4 4 0 1 0-0.001-8.001A4 4 0 0 0 12 12Zm0 2c-3.31 0-6 2.24-6 5v1h12v-1c0-2.76-2.69-5-6-5Z"
            fill="currentColor"
        />
        <path
            d="M19 4v6h-6V8h4V4h2Z"
            fill="currentColor"
        />
    </svg>
));

HeroProgressIcon.displayName = "HeroProgressIcon";

export const HeroStatsIcon = memo(({ className }: StatsViewIconProps) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M5 3h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2Z"
            fill="currentColor"
        />
        <path
            d="M8 9h8v2H8V9Zm0 4h6v2H8v-2Z"
            fill="rgba(12, 18, 32, 0.9)"
        />
    </svg>
));

HeroStatsIcon.displayName = "HeroStatsIcon";
