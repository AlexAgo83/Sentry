declare module "jest-axe" {
    export type AxeResults = {
        violations: unknown[];
    };

    export const axe: (container: unknown, options?: unknown) => Promise<AxeResults>;
}

