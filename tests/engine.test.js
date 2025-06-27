import { suite, test, expect } from "vitest";
import { Engine } from "../src/engine.js";

suite("Engine", () => {
    test("Should create an instance", () => {
        const engine = new Engine();
        expect(engine).toBeTruthy();
    });
});
