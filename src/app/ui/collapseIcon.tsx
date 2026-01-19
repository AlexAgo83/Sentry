import { memo } from "react";

type CollapseIconProps = {
    isCollapsed: boolean;
};

export const CollapseIcon = memo(({ isCollapsed }: CollapseIconProps) => (
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
        {isCollapsed ? (
            <>
                <polyline points="7,4 4,4 4,7" />
                <polyline points="13,4 16,4 16,7" />
                <polyline points="16,13 16,16 13,16" />
                <polyline points="4,13 4,16 7,16" />
            </>
        ) : (
            <>
                <polyline points="9,6 6,6 6,9" />
                <polyline points="11,6 14,6 14,9" />
                <polyline points="14,11 14,14 11,14" />
                <polyline points="6,11 6,14 9,14" />
            </>
        )}
    </svg>
));

CollapseIcon.displayName = "CollapseIcon";
