import { GameSave } from "../../core/types";

export interface PersistenceAdapter {
    load: () => GameSave | null;
    save: (save: GameSave) => void;
}
