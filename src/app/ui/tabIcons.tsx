import { memo } from "react";

export type TabIconKind =
    | "action"
    | "stats"
    | "roster"
    | "inventory"
    | "equipment"
    | "shop"
    | "quests"
    | "hero"
    | "travel";

type TabIconProps = {
    kind: TabIconKind;
};

export const TabIcon = memo(({ kind }: TabIconProps) => {
    switch (kind) {
        case "action":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 2L4 14h7l-1 8 10-14h-7l0-6z"
                    />
                </svg>
            );
        case "stats":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10m6 10V4m6 16v-7m4 7H2" />
                </svg>
            );
        case "roster":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="8" cy="9" r="3" />
                    <circle cx="16" cy="9" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20c1.5-3 3.5-4.5 5-4.5s3.5 1.5 5 4.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 20c1.5-3 3.5-4.5 5-4.5s3.5 1.5 5 4.5" />
                </svg>
            );
        case "hero":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="9" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20c2.5-4 5.5-6 7.5-6s5 2 7.5 6" />
                </svg>
            );
        case "inventory":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l2-3h8l2 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12h3" />
                </svg>
            );
        case "travel":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9l3 6l-6-3z" />
                </svg>
            );
        case "quests":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h7l3 3v13H7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 4v3h3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
            );
        case "equipment":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 2l7 4v6c0 5-3 9-7 10C8 21 5 17 5 12V6l7-4z"
                    />
                </svg>
            );
        case "shop":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 7h16l-1.5 12.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 7z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V5a4 4 0 0 1 8 0v2"
                    />
                </svg>
            );
        default:
            return null;
    }
});

TabIcon.displayName = "TabIcon";
