import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEffect } from "react";
import type { SwUpdateAvailableDetail } from "../../../src/pwa/serviceWorker";
import { SW_UPDATE_AVAILABLE_EVENT } from "../../../src/pwa/serviceWorker";
import { useServiceWorkerUpdatePrompt } from "../../../src/app/hooks/useServiceWorkerUpdatePrompt";

const TestHarness = (props: {
    onState: (state: { version: string | null; close: () => void; reload: () => void }) => void;
}) => {
    const { swUpdate, closeSwUpdate, reloadSwUpdate } = useServiceWorkerUpdatePrompt();
    useEffect(() => {
        props.onState({
            version: swUpdate?.version ?? null,
            close: closeSwUpdate,
            reload: reloadSwUpdate,
        });
    }, [closeSwUpdate, props, reloadSwUpdate, swUpdate?.version]);
    return <div data-testid="version">{swUpdate?.version ?? ""}</div>;
};

describe("useServiceWorkerUpdatePrompt", () => {
    it("shows, ignores, and reloads updates", async () => {
        const state = { version: null as string | null, close: () => undefined, reload: () => undefined };
        render(<TestHarness onState={(next) => Object.assign(state, next)} />);

        const detail: SwUpdateAvailableDetail = {
            version: "1.0.0",
            registration: { waiting: { postMessage: vi.fn() } } as unknown as ServiceWorkerRegistration
        };

        await waitFor(() => {
            window.dispatchEvent(new CustomEvent(SW_UPDATE_AVAILABLE_EVENT, { detail }));
            expect(screen.getByTestId("version").textContent).toBe("1.0.0");
        });

        state.close();
        await waitFor(() => {
            expect(screen.getByTestId("version").textContent).toBe("");
        });

        window.dispatchEvent(new CustomEvent(SW_UPDATE_AVAILABLE_EVENT, { detail }));
        await waitFor(() => {
            expect(screen.getByTestId("version").textContent).toBe("");
        });

        const nextDetail: SwUpdateAvailableDetail = {
            version: "1.0.1",
            registration: { waiting: { postMessage: vi.fn() } } as unknown as ServiceWorkerRegistration
        };
        await waitFor(() => {
            window.dispatchEvent(new CustomEvent(SW_UPDATE_AVAILABLE_EVENT, { detail: nextDetail }));
            expect(screen.getByTestId("version").textContent).toBe("1.0.1");
        });

        state.reload();
        await waitFor(() => {
            expect(screen.getByTestId("version").textContent).toBe("");
        });
    });
});
