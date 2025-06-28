import { suite, test, expect } from "vitest";
import { Engine } from "../../src/engine.js";

suite("DataManager", () => {
    test("Should create an instance", () => {
        expect(new Engine().dataManager).toBeTruthy();
    });
});
