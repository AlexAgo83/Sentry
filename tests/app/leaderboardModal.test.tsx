import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LeaderboardModal } from "../../src/app/components/LeaderboardModal";
import { leaderboardClient } from "../../src/app/api/leaderboardClient";

vi.mock("../../src/app/api/leaderboardClient", () => ({
    leaderboardClient: {
        getEntries: vi.fn()
    },
    LeaderboardApiError: class LeaderboardApiError extends Error {
        status: number;
        code: string;

        constructor(status: number, message: string, code = "unknown_error") {
            super(message);
            this.status = status;
            this.code = code;
        }
    }
}));

const getEntriesMock = vi.mocked(leaderboardClient.getEntries);

describe("LeaderboardModal", () => {
    beforeEach(() => {
        getEntriesMock.mockReset();
    });

    it("loads entries and appends next page on scroll", async () => {
        getEntriesMock
            .mockResolvedValueOnce({
                items: [
                    {
                        userId: "u1",
                        displayName: "Aegis",
                        virtualScore: 2200,
                        updatedAt: "2026-02-14T10:00:00.000Z",
                        appVersion: "0.9.27",
                        isExAequo: true
                    }
                ],
                page: 1,
                perPage: 10,
                hasNextPage: true
            })
            .mockResolvedValueOnce({
                items: [
                    {
                        userId: "u2",
                        displayName: "Guard",
                        virtualScore: 2200,
                        updatedAt: "2026-02-14T09:00:00.000Z",
                        appVersion: "0.9.27",
                        isExAequo: true
                    }
                ],
                page: 2,
                perPage: 10,
                hasNextPage: false
            });

        render(<LeaderboardModal onClose={vi.fn()} />);

        expect(screen.getByTestId("leaderboard-loading")).toBeTruthy();
        expect(await screen.findByText("Aegis")).toBeTruthy();
        expect(getEntriesMock).toHaveBeenCalledWith(1, 10);

        const shell = screen.getByTestId("leaderboard-list-shell");
        Object.defineProperty(shell, "clientHeight", { value: 240, configurable: true });
        Object.defineProperty(shell, "scrollHeight", { value: 500, configurable: true });
        Object.defineProperty(shell, "scrollTop", { value: 270, configurable: true, writable: true });
        fireEvent.scroll(shell);

        expect(await screen.findByText("Guard")).toBeTruthy();
        expect(getEntriesMock).toHaveBeenCalledWith(2, 10);
        expect(screen.getByTestId("leaderboard-end")).toBeTruthy();
        expect(screen.getAllByText("Ex aequo").length).toBe(2);
    });

    it("shows retry after loading error", async () => {
        getEntriesMock
            .mockRejectedValueOnce(new Error("Server unavailable"))
            .mockResolvedValueOnce({
                items: [
                    {
                        userId: "u1",
                        displayName: "Recovered",
                        virtualScore: 100,
                        updatedAt: "2026-02-14T10:00:00.000Z",
                        appVersion: "0.9.27",
                        isExAequo: false
                    }
                ],
                page: 1,
                perPage: 10,
                hasNextPage: false
            });

        render(<LeaderboardModal onClose={vi.fn()} />);

        await waitFor(() => {
            expect(screen.getByTestId("leaderboard-error")).toBeTruthy();
        });
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        expect(await screen.findByText("Recovered")).toBeTruthy();
        expect(getEntriesMock).toHaveBeenCalledTimes(2);
    });
});
