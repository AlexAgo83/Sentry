import { memo } from "react";

const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

export const FaceIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}skin-face.svg#icon`} />
    </svg>
));

FaceIcon.displayName = "FaceIcon";

export const HairIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}skin-hair-v2.svg#icon`} />
    </svg>
));

HairIcon.displayName = "HairIcon";

export const HelmetOnIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}skin-helmet-on.svg#icon`} />
    </svg>
));

HelmetOnIcon.displayName = "HelmetOnIcon";

export const HelmetOffIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}skin-helmet-off.svg#icon`} />
    </svg>
));

HelmetOffIcon.displayName = "HelmetOffIcon";

export const EditOnIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}skin-edit-on.svg#icon`} />
    </svg>
));

EditOnIcon.displayName = "EditOnIcon";

export const EditOffIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}skin-edit-off.svg#icon`} />
    </svg>
));

EditOffIcon.displayName = "EditOffIcon";

export const RenameIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}skin-rename.svg#icon`} />
    </svg>
));

RenameIcon.displayName = "RenameIcon";
