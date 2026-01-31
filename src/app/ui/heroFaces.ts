export const FACE_COUNT = 24;

const hashSeed = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

export const getFaceIndex = (seed?: string | number | null): number => {
    const safeSeed = seed === null || seed === undefined ? "default" : String(seed);
    const hash = hashSeed(safeSeed);
    return (hash % FACE_COUNT) + 1;
};

export const normalizeFaceIndex = (index: number): number => {
    const value = Number.isFinite(index) ? Math.floor(index) : 1;
    const normalized = ((value - 1) % FACE_COUNT + FACE_COUNT) % FACE_COUNT + 1;
    return normalized;
};

export const getFaceUrlByIndex = (index: number): string => {
    const normalized = normalizeFaceIndex(index);
    return `/img/hero/faces/face_${String(normalized).padStart(2, "0")}.svg`;
};

export const getFaceUrl = (seed?: string | number | null): string => {
    const index = getFaceIndex(seed);
    return getFaceUrlByIndex(index);
};
