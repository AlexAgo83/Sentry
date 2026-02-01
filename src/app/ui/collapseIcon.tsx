import { memo } from "react";

type CollapseIconProps = {
    isCollapsed: boolean;
};

const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

export const CollapseIcon = memo(({ isCollapsed }: CollapseIconProps) => (
    <svg className="ts-collapse-icon" viewBox="0 0 20 20" aria-hidden="true">
        <use href={`${UI_ICON_PATH}${isCollapsed ? "collapse-out" : "collapse-in"}.svg#icon`} />
    </svg>
));

CollapseIcon.displayName = "CollapseIcon";
