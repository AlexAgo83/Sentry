export const HAIR_COUNT = 10;
const HAIR_COLORS = [
    "#1f1a17",
    "#2e2420",
    "#3b2c22",
    "#4a3223",
    "#5b3d2a",
    "#6c4a2f",
    "#7a5636",
    "#8c6a4b",
    "#a37b52",
    "#b88c62",
    "#cda277",
    "#d8c2a3"
];

const hashSeed = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

export const getHairIndex = (seed?: string | number | null): number => {
    const safeSeed = seed === null || seed === undefined ? "default" : String(seed);
    const hash = hashSeed(safeSeed);
    return (hash % HAIR_COUNT) + 1;
};

export const normalizeHairIndex = (index: number): number => {
    const value = Number.isFinite(index) ? Math.floor(index) : 1;
    const normalized = ((value - 1) % HAIR_COUNT + HAIR_COUNT) % HAIR_COUNT + 1;
    return normalized;
};

export const getHairUrlByIndex = (index: number): string => {
    const normalized = normalizeHairIndex(index);
    return `/assets/hero/hairstyles/hair_${String(normalized).padStart(2, "0")}.svg`;
};

export const getHairUrl = (seed?: string | number | null): string => {
    const index = getHairIndex(seed);
    return getHairUrlByIndex(index);
};

export const getHairColor = (seed?: string | number | null): string => {
    const safeSeed = seed === null || seed === undefined ? "default" : String(seed);
    const hash = hashSeed(`${safeSeed}-hair-color`);
    return HAIR_COLORS[hash % HAIR_COLORS.length];
};

const SKIN_COLORS = [
    "#f2d6b3",
    "#e7c6a0",
    "#d7b089",
    "#c79a72",
    "#b5835a",
    "#a06f4b",
    "#8a5b3b",
    "#6e4630",
    "#d8c2a3"
];

export const getSkinColor = (seed?: string | number | null): string => {
    const safeSeed = seed === null || seed === undefined ? "default" : String(seed);
    const hash = hashSeed(`${safeSeed}-skin-color`);
    return SKIN_COLORS[hash % SKIN_COLORS.length];
};
