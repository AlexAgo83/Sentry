const FIRST_NAMES_EN = [
    "Alden", "Mira", "Korin", "Lyra", "Bram", "Soren", "Iris", "Vera", "Dorian", "Kara",
    "Nolan", "Rhea", "Silas", "Eira", "Tobin", "Maeve", "Rowan", "Nora", "Galen", "Freya",
    "Cassian", "Elara", "Theron", "Livia", "Orin", "Selene", "Kael", "Brina", "Leander", "Nyra",
    "Marek", "Talia", "Evren", "Celia", "Darien", "Ilya", "Ren", "Thalia", "Quinn", "Arden",
    "Lucan", "Sable", "Cedric", "Ayla", "Alaric", "Juniper", "Tristan", "Lenora", "Bastien", "Maris",
    "Finn", "Odette", "Hector", "Nia", "Perrin", "Soraya", "Kieran", "Elise", "Jasper", "Wren"
];

const LAST_NAMES_EN = [
    "Ashford", "Briar", "Coldbrook", "Duskbane", "Emberfall", "Frostmere", "Grimshaw", "Hawke",
    "Ironfield", "Kestrel", "Lightwell", "Moonridge", "Nightbloom", "Oakheart", "Pyre", "Ravenwood",
    "Stormvale", "Thornfield", "Vale", "Windmere", "Blackthorn", "Cinder", "Dawncrest", "Everhart",
    "Flint", "Glenfall", "Highmore", "Ivory", "Kingsley", "Larkspur", "Mournwood", "Northwind",
    "Oakhaven", "Pinecrest", "Quickwater", "Redfern", "Stonehelm", "Truevale", "Umber", "Voss",
    "Westbrook", "Yarrow", "Zephyr", "Brightmoor", "Crowley", "Deepwell", "Ebonridge", "Fairfield",
    "Goldleaf", "Harrow", "Ironsong", "Jadeford", "Keel", "Longstride", "Mistborne", "Nightsong"
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
