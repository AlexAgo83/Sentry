import { memo } from "react";

const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

export const QuestCompletedShowIcon = memo(({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <use href={`${UI_ICON_PATH}qc_show.svg#icon`} />
    </svg>
));

QuestCompletedShowIcon.displayName = "QuestCompletedShowIcon";

export const QuestCompletedHideIcon = memo(({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
        <use href={`${UI_ICON_PATH}qc_hide.svg#icon`} />
    </svg>
));

QuestCompletedHideIcon.displayName = "QuestCompletedHideIcon";
