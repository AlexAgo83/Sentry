import { test, expect } from "@playwright/test";

const HERO_NAME = "E2E Hero";

const ensureHero = async (page: import("@playwright/test").Page) => {
    const input = page.getByTestId("onboarding-hero-name");
    if (await input.count()) {
        await input.fill(HERO_NAME);
        await page.getByTestId("onboarding-create-hero").click();
        await expect(input).toBeHidden();
    }
};

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        window.localStorage.clear();
    });
    await page.goto("/");
    await ensureHero(page);
});

test("new game onboarding", async ({ page }) => {
    await expect(page.getByTestId("roster-panel")).toContainText(HERO_NAME);
});

test("inventory sell flow", async ({ page }) => {
    await page.evaluate(() => {
        const api = (window as unknown as { __E2E__?: { addInventoryItem?: (id: string, count: number) => void } }).__E2E__;
        api?.addInventoryItem?.("meat", 3);
    });

    await page.getByTestId("tab-inventory").click();
    const meatSlot = page.getByTestId("inventory-slot-meat");
    await expect(meatSlot).toBeVisible();
    await meatSlot.click();

    await page.getByTestId("inventory-sell-all").click();
    const confirmSell = page.getByTestId("inventory-confirm-sell");
    await expect(confirmSell).toBeVisible();
    await confirmSell.click();
    await expect(confirmSell).toBeHidden();
});

test("cloud auth, upload, download, conflict", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ accessToken: "e2e-token" })
        });
    });

    const savePayload = await page.evaluate(() => {
        const api = (window as unknown as { __E2E__?: { getSavePayload?: () => unknown } }).__E2E__;
        return api?.getSavePayload?.() ?? null;
    });

    await page.route("**/api/v1/saves/latest", async (route) => {
        const method = route.request().method();
        if (method === "GET") {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    payload: savePayload,
                    meta: {
                        updatedAt: new Date().toISOString(),
                        virtualScore: 1234,
                        appVersion: "0.0.0"
                    }
                })
            });
            return;
        }
        if (method === "PUT") {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    meta: {
                        updatedAt: new Date().toISOString(),
                        virtualScore: 9999,
                        appVersion: "0.8.18"
                    }
                })
            });
            return;
        }
        await route.fallback();
    });

    await page.route("**/api/v1/users/me/profile", async (route) => {
        const method = route.request().method();
        if (method === "GET") {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ profile: {
                    email: "e2e@example.com",
                    username: "E2EPlayer",
                    maskedEmail: "e2e@example.com",
                    displayName: "E2EPlayer"
                } })
            });
            return;
        }
        if (method === "PATCH") {
            const requestBody = route.request().postDataJSON() as { username?: string | null };
            const nextUsername = requestBody?.username ?? null;
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ profile: {
                    email: "e2e@example.com",
                    username: nextUsername,
                    maskedEmail: "e2e@example.com",
                    displayName: nextUsername || "e2e@example.com"
                } })
            });
            return;
        }
        await route.fallback();
    });

    await page.getByRole("button", { name: "Open settings" }).first().click();
    await page.getByTestId("open-save-options").click();
    await page.getByTestId("open-cloud-save").click();

    await page.getByTestId("cloud-email").fill("e2e@example.com");
    await page.getByTestId("cloud-password").fill("password");
    await page.getByTestId("cloud-login").click();
    await expect(page.getByTestId("cloud-logout")).toBeVisible();

    await page.getByTestId("cloud-refresh").click();
    await expect(page.getByTestId("cloud-diff-header")).toBeVisible();

    await page.getByTestId("cloud-load").click();

    const uploadPromise = page.waitForResponse((response) =>
        response.url().includes("/api/v1/saves/latest") && response.request().method() === "PUT"
    );
    await page.getByTestId("cloud-overwrite").click();
    await uploadPromise;
});

test.describe("mobile roster navigation", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("open roster tab", async ({ page }) => {
        await page.getByRole("button", { name: "Open roster" }).click();
        await expect(page.locator(".app-roster-drawer")).toHaveClass(/is-open/);
        await expect(page.getByTestId("roster-panel")).toBeVisible();
    });

    test("closing roster tab removes global scroll lock", async ({ page }) => {
        await page.getByRole("button", { name: "Open roster" }).click();
        await expect(page.locator(".app-roster-drawer")).toHaveClass(/is-open/);

        await expect.poll(async () => page.evaluate(() => ({
            classOn: document.body.classList.contains("is-roster-drawer-open"),
            bodyOverflow: document.body.style.overflow,
            htmlOverflow: document.documentElement.style.overflow
        }))).toEqual({
            classOn: true,
            bodyOverflow: "hidden",
            htmlOverflow: ""
        });

        await page.locator(".app-roster-drawer-backdrop").click({ position: { x: 300, y: 300 } });
        await expect(page.locator(".app-roster-drawer")).not.toHaveClass(/is-open/);

        await expect.poll(async () => page.evaluate(() => ({
            classOn: document.body.classList.contains("is-roster-drawer-open"),
            bodyOverflow: document.body.style.overflow,
            htmlOverflow: document.documentElement.style.overflow
        }))).toEqual({
            classOn: false,
            bodyOverflow: "",
            htmlOverflow: ""
        });
    });
});
