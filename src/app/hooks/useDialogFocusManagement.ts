import type { RefObject } from "react";
import { useEffect } from "react";

type UseDialogFocusManagementOptions = {
    dialogRef: RefObject<HTMLElement | null>;
    isOpen: boolean;
    initialFocusRef?: RefObject<HTMLElement | null>;
    restoreFocus?: boolean;
};

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
].join(",");

const isDisabled = (element: HTMLElement): boolean => {
    if ("disabled" in element) {
        return Boolean((element as HTMLButtonElement).disabled);
    }
    return false;
};

const isVisible = (element: HTMLElement): boolean => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
};

const canReceiveFocus = (element: HTMLElement | null): element is HTMLElement => {
    if (!element || isDisabled(element) || element.getAttribute("aria-hidden") === "true") {
        return false;
    }
    return isVisible(element);
};

const getFocusableElements = (container: HTMLElement): HTMLElement[] => (
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((element) => canReceiveFocus(element))
);

export const useDialogFocusManagement = ({
    dialogRef,
    isOpen,
    initialFocusRef,
    restoreFocus = true
}: UseDialogFocusManagementOptions) => {
    useEffect(() => {
        if (!isOpen || typeof document === "undefined") {
            return;
        }
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        const previouslyFocused = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        const preferredTarget = initialFocusRef?.current ?? null;
        if (canReceiveFocus(preferredTarget)) {
            preferredTarget.focus();
        } else {
            const focusable = getFocusableElements(dialog);
            if (focusable.length > 0) {
                focusable[0].focus();
            } else {
                dialog.focus();
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Tab") {
                return;
            }
            const container = dialogRef.current;
            if (!container) {
                return;
            }
            const focusable = getFocusableElements(container);
            if (focusable.length === 0) {
                event.preventDefault();
                container.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const activeElement = document.activeElement;
            const activeOutsideContainer = !(activeElement instanceof Node) || !container.contains(activeElement);

            if (event.shiftKey) {
                if (activeOutsideContainer || activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }
                return;
            }

            if (activeOutsideContainer || activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            if (restoreFocus && previouslyFocused && previouslyFocused.isConnected) {
                previouslyFocused.focus();
            }
        };
    }, [dialogRef, initialFocusRef, isOpen, restoreFocus]);
};
