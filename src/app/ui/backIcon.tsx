import { memo } from "react";

export const BackIcon = memo(() => (
    <svg
        className="ts-collapse-icon"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="9,4 3,10 9,16" />
        <line x1="3" y1="10" x2="17" y2="10" />
    </svg>
));

BackIcon.displayName = "BackIcon";

