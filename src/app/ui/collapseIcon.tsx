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
        <line x1="4" y1="10" x2="16" y2="10" />
        {isCollapsed ? <line x1="10" y1="4" x2="10" y2="16" /> : null}
    </svg>
));

CollapseIcon.displayName = "CollapseIcon";
