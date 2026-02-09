import { memo } from "react";

const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

export const SystemIcon = memo(({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 600 600" aria-hidden="true">
        <use href={`${UI_ICON_PATH}system.svg#icon`} />
    </svg>
));

SystemIcon.displayName = "SystemIcon";
