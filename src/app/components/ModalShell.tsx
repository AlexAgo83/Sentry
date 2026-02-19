import { memo, useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { useDialogFocusManagement } from "../hooks/useDialogFocusManagement";

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
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const titleId = useId();
    const hasKicker = kicker !== null && kicker !== undefined && kicker !== false && kicker !== "";

    useDialogFocusManagement({
        dialogRef,
        initialFocusRef: closeButtonRef,
        isOpen: true
    });

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
            onClick={onBackdropClick ?? onClose}
        >
            <div
                ref={dialogRef}
                className="ts-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="ts-modal-header">
                    <div>
                        {hasKicker ? (
                            <p className="ts-modal-kicker">{kicker}</p>
                        ) : null}
                        <h2 id={titleId} className="ts-modal-title">{title}</h2>
                    </div>
                    {showClose ? (
                        <button
                            ref={closeButtonRef}
                            type="button"
                            className="ts-modal-close ts-focusable"
                            onClick={onClose}
                            title={closeLabel}
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
