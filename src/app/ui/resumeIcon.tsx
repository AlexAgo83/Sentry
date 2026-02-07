import { memo } from "react";

const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

export const ResumeIcon = memo(() => (
    <svg className="ts-collapse-icon" viewBox="0 0 20 20" aria-hidden="true">
        <use href={`${UI_ICON_PATH}resume.svg#icon`} />
    </svg>
));

ResumeIcon.displayName = "ResumeIcon";
