const FIRST_NAMES_EN = [
    "Alden", "Mira", "Korin", "Lyra", "Bram", "Soren", "Iris", "Vera", "Dorian", "Kara",
    "Nolan", "Rhea", "Silas", "Eira", "Tobin", "Maeve", "Rowan", "Nora", "Galen", "Freya"
];

const LAST_NAMES_EN = [
    "Ashford", "Briar", "Coldbrook", "Duskbane", "Emberfall", "Frostmere", "Grimshaw", "Hawke",
    "Ironfield", "Kestrel", "Lightwell", "Moonridge", "Nightbloom", "Oakheart", "Pyre", "Ravenwood",
    "Stormvale", "Thornfield", "Vale", "Windmere"
];

const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const buildName = () => `${randomItem(FIRST_NAMES_EN)} ${randomItem(LAST_NAMES_EN)}`;

export const generateUniqueEnglishHeroNames = (count: number): string[] => {
    const target = Math.max(0, Math.floor(count));
    const unique = new Set<string>();

    while (unique.size < target) {
        unique.add(buildName());
    }

    return Array.from(unique);
};
