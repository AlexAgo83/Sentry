import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../../src/app/components/ErrorBoundary";

describe("ErrorBoundary", () => {
    it("renders fallback UI when a child throws", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        const Thrower = () => {
            throw new Error("kaput");
        };

        render(
            <ErrorBoundary appVersion="1.2.3">
                <Thrower />
            </ErrorBoundary>
        );

        expect(screen.getByText("Something went wrong")).toBeTruthy();
        expect(screen.getByText("kaput")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Reload" })).toBeTruthy();
    });
});
