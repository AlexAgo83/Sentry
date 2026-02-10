import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProgressionTrendChart } from "../../src/app/components/ProgressionTrendChart";

describe("ProgressionTrendChart", () => {
    it("triggers hover callbacks from points and chart leave", () => {
        const onHoverIndexChange = vi.fn();
        const { container } = render(
            <ProgressionTrendChart
                labels={["02-09", "02-10"]}
                xpSeries={[10, 25]}
                goldSeries={[5, 15]}
                formatNumber={(value) => String(value)}
                hoverIndex={null}
                onHoverIndexChange={onHoverIndexChange}
            />
        );

        const points = container.querySelectorAll("circle");
        expect(points.length).toBe(4);
        fireEvent.mouseEnter(points[0]);
        expect(onHoverIndexChange).toHaveBeenCalledWith(0);

        const chart = screen.getByRole("img", { name: "XP and gold trend" });
        fireEvent.mouseLeave(chart);
        expect(onHoverIndexChange).toHaveBeenCalledWith(null);
    });

    it("renders tooltip when hover index is valid and hides it when out of range", () => {
        const onHoverIndexChange = vi.fn();
        const { container, rerender } = render(
            <ProgressionTrendChart
                labels={["02-09", "02-10"]}
                xpSeries={[100, 200]}
                goldSeries={[50, 75]}
                formatNumber={(value) => String(value)}
                hoverIndex={1}
                onHoverIndexChange={onHoverIndexChange}
            />
        );

        expect(screen.getAllByText("02-10").length).toBeGreaterThan(0);
        expect(screen.getAllByText("XP 200").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Gold 75").length).toBeGreaterThan(0);

        rerender(
            <ProgressionTrendChart
                labels={["02-09", "02-10"]}
                xpSeries={[100, 200]}
                goldSeries={[50, 75]}
                formatNumber={(value) => String(value)}
                hoverIndex={99}
                onHoverIndexChange={onHoverIndexChange}
            />
        );

        expect(container.querySelector(".ts-prog-tooltip")).toBeNull();
    });

    it("supports single-point series and still renders tooltip values", () => {
        render(
            <ProgressionTrendChart
                labels={["02-10"]}
                xpSeries={[0]}
                goldSeries={[0]}
                formatNumber={(value) => String(value)}
                hoverIndex={0}
                onHoverIndexChange={vi.fn()}
            />
        );

        expect(screen.getAllByText("02-10").length).toBeGreaterThan(0);
        expect(screen.getByText("XP 0")).toBeTruthy();
        expect(screen.getByText("Gold 0")).toBeTruthy();
    });

    it("falls back to xp tooltip positioning when gold point is missing at hovered index", () => {
        render(
            <ProgressionTrendChart
                labels={["02-09", "02-10"]}
                xpSeries={[10, 20]}
                goldSeries={[5]}
                formatNumber={(value) => String(value)}
                hoverIndex={1}
                onHoverIndexChange={vi.fn()}
            />
        );

        expect(screen.getAllByText("XP 20").length).toBeGreaterThan(0);
        expect(screen.getByText("Gold undefined")).toBeTruthy();
    });
});
