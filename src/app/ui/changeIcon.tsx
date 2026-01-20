import { memo } from "react";

export const ChangeIcon = memo(() => (
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
        <path d="M4 10a6 6 0 0 1 10.5-4" />
        <polyline points="15,2.5 15,6.5 11,6.5" />
        <path d="M16 10a6 6 0 0 1-10.5 4" />
        <polyline points="5,17.5 5,13.5 9,13.5" />
    </svg>
));

ChangeIcon.displayName = "ChangeIcon";

