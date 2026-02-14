import { WORLD_HEIGHT, WORLD_WIDTH } from "./constants";

export const toWorldX = (x: number) => x * WORLD_WIDTH;
export const toWorldY = (y: number) => y * WORLD_HEIGHT;

export const parseHexColor = (value: string | undefined, fallback: number) => {
    if (!value || !value.startsWith("#")) {
        return fallback;
    }
    const parsed = Number.parseInt(value.slice(1), 16);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const hashString = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) % 1_000_000;
    }
    return hash;
};

export const mixColors = (base: number, overlay: number, amount: number) => {
    const clamped = clamp(amount, 0, 1);
    const br = (base >> 16) & 0xff;
    const bg = (base >> 8) & 0xff;
    const bb = base & 0xff;
    const or = (overlay >> 16) & 0xff;
    const og = (overlay >> 8) & 0xff;
    const ob = overlay & 0xff;
    const r = Math.round(br + (or - br) * clamped);
    const g = Math.round(bg + (og - bg) * clamped);
    const b = Math.round(bb + (ob - bb) * clamped);
    return (r << 16) + (g << 8) + b;
};
