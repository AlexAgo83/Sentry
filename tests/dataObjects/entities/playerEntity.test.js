import { suite, test, expect } from "vitest";
import { PlayerEntity } from "../../../src/dataObjects/entities/playerEntity.js";

suite("PlayerEntity", () => {
    test("Should create an instance", () => {
        expect(new PlayerEntity(1)).toBeTruthy();
    });
});

suite("PlayerEntity", () => {
    test("Should create an instance", () => {
        const entity = new PlayerEntity(1)
        expect(entity.saveSkills()).toBeTruthy();
    });
});