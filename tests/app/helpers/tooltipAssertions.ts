const describeElement = (el: Element) => {
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    const testId = el.getAttribute("data-testid");
    const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
    const klass = (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean).slice(0, 4).join(".");
    return `${tag}${role ? `[role=${role}]` : ""}${testId ? `[data-testid=${testId}]` : ""}${klass ? `.${klass}` : ""} :: "${text}"`;
};

export const getTooltipCoverageViolations = (root: HTMLElement = document.body) => {
    const buttons = Array.from(root.querySelectorAll("button"));
    const links = Array.from(root.querySelectorAll("a[href]"));
    const roleButtons = Array.from(root.querySelectorAll("[role=\"button\"]"));
    const roleLinks = Array.from(root.querySelectorAll("[role=\"link\"]"));
    const clickables = [...buttons, ...links, ...roleButtons, ...roleLinks];

    const missingTitles = clickables
        .filter((el) => el.getAttribute("aria-hidden") !== "true")
        .filter((el) => {
            const title = (el.getAttribute("title") ?? "").trim();
            return title.length === 0;
        })
        .map(describeElement);

    const iconOnlyButtonsMissingAria = buttons
        .filter((el) => el.getAttribute("aria-hidden") !== "true")
        .filter((el) => (el.textContent ?? "").trim().length === 0)
        .filter((el) => (el.getAttribute("aria-label") ?? "").trim().length === 0)
        .map(describeElement);

    return { missingTitles, iconOnlyButtonsMissingAria };
};

