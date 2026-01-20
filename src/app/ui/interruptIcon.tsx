import { memo } from "react";

export const InterruptIcon = memo(() => (
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
        <rect x="5" y="5" width="10" height="10" rx="2" />
    </svg>
));

InterruptIcon.displayName = "InterruptIcon";

