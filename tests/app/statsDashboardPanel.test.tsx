import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatsDashboardPanel } from "../../src/app/components/StatsDashboardPanel";
import { buildCombatDisplay } from "../../src/app/selectors/combatSelectors";
import { createPlayerStatsState, computeEffectiveStats } from "../../src/core/stats";
import type { ProgressionState, StatModifier } from "../../src/core/types";

type StatsDashboardProps = ComponentProps<typeof StatsDashboardPanel>;

const createProgressionState = (buckets: ProgressionState["buckets"] = []): ProgressionState => ({ buckets });

const createProps = (overrides: Partial<StatsDashboardProps> = {}): StatsDashboardProps => {
    const stats = createPlayerStatsState();
    const effectiveStats = computeEffectiveStats(stats);

    return {
        heroProgression: createProgressionState(),
        globalProgression: createProgressionState(),
        globalVirtualScore: 0,
        heroVirtualScore: 0,
        stats,
        effectiveStats,
        equipmentMods: [],
        combatDisplay: buildCombatDisplay(1, stats, effectiveStats, "Melee"),
        combatSkillProgress: {
            CombatMelee: { level: 1, xp: 12, xpNext: 120 },
            CombatRanged: { level: 1, xp: 4, xpNext: 120 },
            CombatMagic: { level: 1, xp: 8, xpNext: 120 }
        },
        weaponType: "Melee",
        isCollapsed: false,
        onToggleCollapsed: vi.fn(),
        ...overrides
    };
};

describe("StatsDashboardPanel", () => {
    it("shows the empty hero progression state when no data exists", () => {
        render(<StatsDashboardPanel {...createProps()} />);

        expect(screen.getByText("No hero data yet — start an action to begin tracking.")).toBeTruthy();
        expect(screen.getByText("No activity yet.")).toBeTruthy();
        expect(screen.getByText("No data yet.")).toBeTruthy();
    });

    it("hides the panel body when collapsed", () => {
        render(<StatsDashboardPanel {...createProps({ isCollapsed: true })} />);

        expect(screen.getByRole("button", { name: "Expand" })).toBeTruthy();
        expect(screen.queryByText("XP / 7d")).toBeNull();
        expect(screen.queryByText("Attributes")).toBeNull();
    });

    it("renders global progression content with skills and trend", async () => {
        const user = userEvent.setup();
        const globalProgression = createProgressionState([{
            dayKey: "2026-02-10",
            xp: 150,
            gold: 90,
            activeMs: 420000,
            idleMs: 0,
            skillActiveMs: {
                CombatMelee: 300000,
                Fishing: 120000
            }
        }]);

        render(
            <StatsDashboardPanel
                {...createProps({
                    globalProgression,
                    globalVirtualScore: 1234
                })}
            />
        );

        await user.click(screen.getByRole("tab", { name: "Global progression" }));

        expect(screen.getByText("Combat - Melee")).toBeTruthy();
        expect(screen.queryByText("No activity yet.")).toBeNull();
        expect(screen.queryByText("No data yet.")).toBeNull();
        expect(screen.getByText("1,234")).toBeTruthy();
    });

    it("renders resistance metric values in hero stats view", async () => {
        const user = userEvent.setup();
        const stats = createPlayerStatsState();
        stats.base.Armor = 10;
        const armorBonus: StatModifier = {
            id: "armor-flat",
            stat: "Armor",
            kind: "flat",
            value: 10,
            source: "Armor set"
        };
        stats.permanentMods.push(armorBonus);
        const effectiveStats = computeEffectiveStats(stats);

        render(
            <StatsDashboardPanel
                {...createProps({
                    stats,
                    effectiveStats,
                    combatDisplay: buildCombatDisplay(10, stats, effectiveStats, "Ranged"),
                    weaponType: "Ranged"
                })}
            />
        );

        await user.click(screen.getByRole("tab", { name: "Hero statistics" }));

        expect(screen.getByText("Resistance %")).toBeTruthy();
        expect(screen.getByText("-12.5%")).toBeTruthy();
        expect(screen.getByText("+12.5%")).toBeTruthy();
        expect(screen.getByText("0.0%")).toBeTruthy();
    });

    it("renders combat xp values in hero stats view", async () => {
        const user = userEvent.setup();
        render(<StatsDashboardPanel {...createProps()} />);

        await user.click(screen.getByRole("tab", { name: "Hero statistics" }));

        expect(screen.getByText("XP 12/120")).toBeTruthy();
        expect(screen.getByText("XP 4/120")).toBeTruthy();
        expect(screen.getByText("XP 8/120")).toBeTruthy();
    });

    it("supports arrow-key navigation across stats tabs and tabpanel linkage", async () => {
        const user = userEvent.setup();
        render(<StatsDashboardPanel {...createProps()} />);

        const globalTab = screen.getByRole("tab", { name: "Global progression" });
        globalTab.focus();
        await user.keyboard("{ArrowRight}");

        const heroProgressTab = screen.getByRole("tab", { name: "Hero progression" });
        const tabPanel = screen.getByRole("tabpanel");

        expect(heroProgressTab.getAttribute("aria-selected")).toBe("true");
        expect(tabPanel.getAttribute("aria-labelledby")).toBe(heroProgressTab.id);
    });

});
