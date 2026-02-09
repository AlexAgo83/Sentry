import { memo } from "react";

export const SystemIcon = memo(({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
        <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="10" cy="10" r="3.2" />
            <path d="M10 1.5v2.4" />
            <path d="M10 16.1v2.4" />
            <path d="M1.5 10h2.4" />
            <path d="M16.1 10h2.4" />
            <path d="M4 4l1.7 1.7" />
            <path d="M14.3 14.3L16 16" />
            <path d="M4 16l1.7-1.7" />
            <path d="M14.3 5.7L16 4" />
        </g>
    </svg>
));

SystemIcon.displayName = "SystemIcon";
