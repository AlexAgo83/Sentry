import { memo, useEffect } from "react";
import type { ReactNode } from "react";

let openModalCount = 0;

type ModalShellProps = {
    kicker?: ReactNode;
    title: ReactNode;
    onClose: () => void;
    children: ReactNode;
    closeLabel?: string;
    showClose?: boolean;
    onBackdropClick?: () => void;
    onEscape?: () => void;
};

export const ModalShell = memo(({
    kicker,
    title,
    onClose,
    children,
    closeLabel = "Close",
    showClose = true,
    onBackdropClick,
    onEscape
}: ModalShellProps) => {
    const hasKicker = kicker !== null && kicker !== undefined && kicker !== false && kicker !== "";

    useEffect(() => {
        openModalCount += 1;
        document.documentElement.classList.add("ts-any-modal-open");
        return () => {
            openModalCount = Math.max(0, openModalCount - 1);
            if (openModalCount === 0) {
                document.documentElement.classList.remove("ts-any-modal-open");
            }
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                (onEscape ?? onClose)();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, onEscape]);

    return (
        <div
            className="ts-modal-backdrop"
            role="dialog"
            aria-modal="true"
            onClick={onBackdropClick ?? onClose}
        >
            <div className="ts-modal" onClick={(event) => event.stopPropagation()}>
                <div className="ts-modal-header">
                    <div>
                        {hasKicker ? (
                            <p className="ts-modal-kicker">{kicker}</p>
                        ) : null}
                        <h2 className="ts-modal-title">{title}</h2>
                    </div>
                    {showClose ? (
                        <button
                            type="button"
                            className="ts-modal-close ts-focusable"
                            onClick={onClose}
                        >
                            {closeLabel}
                        </button>
                    ) : null}
                </div>
                <div className="ts-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
});

ModalShell.displayName = "ModalShell";
