const FACE_COUNT = 24;

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

export const getFaceUrl = (seed?: string | number | null): string => {
    const index = getFaceIndex(seed);
    return `/assets/hero/faces/face_${String(index).padStart(2, "0")}.svg`;
};
