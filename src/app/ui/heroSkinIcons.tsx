import { memo } from "react";

export const FaceIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="10" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
            d="M7 20c1.6-3 3.8-4.5 5-4.5s3.4 1.5 5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
        <path
            d="M10 10h.01M14 10h.01"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <path
            d="M10.5 12.5c.8.6 2.2.6 3 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
        />
    </svg>
));

FaceIcon.displayName = "FaceIcon";

export const HairIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d="M6 12c0-4 3-7 6-7s6 3 6 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
        <path
            d="M5 12c0 5 3.5 8 7 8s7-3 7-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
        <path
            d="M8 8c1.4 1.6 3 2.2 4 2.2S14.6 9.6 16 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
    </svg>
));

HairIcon.displayName = "HairIcon";

export const HelmetOnIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d="M6 12a6 6 0 0 1 12 0v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path d="M4 12h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.5 8.5h7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
));

HelmetOnIcon.displayName = "HelmetOnIcon";

export const HelmetOffIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d="M6 12a6 6 0 0 1 12 0v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path d="M4 12h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 5l14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
));

HelmetOffIcon.displayName = "HelmetOffIcon";

export const EditOnIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d="M4 16.5V20h3.5L19 8.5l-3.5-3.5L4 16.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path d="M14.5 5l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
));

EditOnIcon.displayName = "EditOnIcon";

export const EditOffIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d="M4 16.5V20h3.5L19 8.5l-3.5-3.5L4 16.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
));

EditOffIcon.displayName = "EditOffIcon";

export const RenameIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d="M7 4h7l5 5v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path d="M14 4v5h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 12h6M9 15h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
));

RenameIcon.displayName = "RenameIcon";
