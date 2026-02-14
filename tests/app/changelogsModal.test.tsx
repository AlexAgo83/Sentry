import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChangelogsModal } from "../../src/app/components/ChangelogsModal";
import { changelogClient } from "../../src/app/api/changelogClient";

vi.mock("../../src/app/api/changelogClient", () => ({
    changelogClient: {
        getCommits: vi.fn()
    }
}));

const getCommitsMock = vi.mocked(changelogClient.getCommits);

describe("ChangelogsModal", () => {
    beforeEach(() => {
        getCommitsMock.mockReset();
    });

    it("loads commits and appends the next page when scrolling near bottom", async () => {
        getCommitsMock
            .mockResolvedValueOnce({
                items: [
                    {
                        sha: "abcdef1234567890",
                        shortSha: "abcdef1",
                        message: "First commit",
                        author: "Alice",
                        committedAt: Date.parse("2026-02-14T10:00:00.000Z"),
                        url: "https://github.com/AlexAgo83/Sentry/commit/abcdef1234567890"
                    }
                ],
                page: 1,
                perPage: 10,
                hasNextPage: true,
                source: "github"
            })
            .mockResolvedValueOnce({
                items: [
                    {
                        sha: "fedcba1234567890",
                        shortSha: "fedcba1",
                        message: "Second page commit",
                        author: "Bob",
                        committedAt: Date.parse("2026-02-13T10:00:00.000Z")
                    }
                ],
                page: 2,
                perPage: 10,
                hasNextPage: false,
                source: "github"
            });

        render(<ChangelogsModal onClose={vi.fn()} />);

        expect(screen.getByTestId("changelog-loading")).toBeTruthy();
        expect(await screen.findByText("First commit")).toBeTruthy();
        expect(getCommitsMock).toHaveBeenCalledWith(1, 10);
        const shell = screen.getByTestId("changelog-list-shell");
        Object.defineProperty(shell, "clientHeight", { value: 240, configurable: true });
        Object.defineProperty(shell, "scrollHeight", { value: 500, configurable: true });
        Object.defineProperty(shell, "scrollTop", { value: 270, configurable: true, writable: true });
        fireEvent.scroll(shell);
        expect(await screen.findByText("Second page commit")).toBeTruthy();
        expect(getCommitsMock).toHaveBeenCalledWith(2, 10);
        expect(screen.getByTestId("changelog-end")).toBeTruthy();
    });

    it("shows retry state after an error", async () => {
        const rateLimitError = Object.assign(
            new Error("GitHub rate limit reached. Please retry shortly."),
            {
                code: "rate_limited",
                retryAfterSeconds: 30
            }
        );
        getCommitsMock
            .mockRejectedValueOnce(rateLimitError)
            .mockResolvedValueOnce({
                items: [
                    {
                        sha: "abcdef1234567890",
                        shortSha: "abcdef1",
                        message: "Recovered commit",
                        author: "Alice",
                        committedAt: Date.parse("2026-02-14T10:00:00.000Z")
                    }
                ],
                page: 1,
                perPage: 10,
                hasNextPage: false,
                source: "github"
            });

        render(<ChangelogsModal onClose={vi.fn()} />);

        await waitFor(() => {
            expect(screen.getByTestId("changelog-error")).toBeTruthy();
        });
        expect(screen.getByText("GitHub rate limit reached. Retry in about 30s.")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        expect(await screen.findByText("Recovered commit")).toBeTruthy();
        expect(getCommitsMock).toHaveBeenCalledTimes(2);
    });
});
