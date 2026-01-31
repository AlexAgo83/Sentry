import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CSSProperties } from "react";
import { Avatar } from "../../src/app/components/Avatar";

describe("Avatar", () => {
    it("renders avatar layers and optional skill icon", () => {
        const { container } = render(
            <Avatar
                variant="large"
                isPlaceholder
                skillId="Combat"
                skillColor="#111111"
                style={{ "--ts-avatar-skin": "#ffffff" } as CSSProperties}
            />
        );

        const avatar = container.querySelector(".ts-player-avatar");
        expect(avatar).toBeTruthy();
        expect(avatar?.classList.contains("ts-player-avatar--large")).toBe(true);
        expect(avatar?.classList.contains("is-placeholder")).toBe(true);

        const layers = container.querySelectorAll(".ts-player-avatar-layer");
        expect(layers.length).toBe(13);

        const skill = container.querySelector(".ts-player-avatar-skill");
        expect(skill).toBeTruthy();
    });
});
