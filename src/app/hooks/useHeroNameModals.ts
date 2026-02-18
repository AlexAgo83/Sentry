import { useCallback, useState } from "react";
import { gameStore } from "../game";
import { generateUniqueEnglishHeroNames } from "../ui/heroNames";

type UseHeroNameModalsOptions = {
    onBeforeOpenRecruit?: () => void;
    onBeforeOpenRename?: () => void;
};

export const useHeroNameModals = (options: UseHeroNameModalsOptions = {}) => {
    const { onBeforeOpenRecruit, onBeforeOpenRename } = options;
    const [isRecruitOpen, setRecruitOpen] = useState(false);
    const [isRenameOpen, setRenameOpen] = useState(false);
    const [renamePlayerId, setRenamePlayerId] = useState<string | null>(null);
    const [newHeroName, setNewHeroName] = useState("");
    const [renameHeroName, setRenameHeroName] = useState("");

    const closeRecruit = useCallback(() => {
        setRecruitOpen(false);
        setNewHeroName("");
    }, []);

    const openRecruit = useCallback(() => {
        const existingNames = new Set(
            Object.values(gameStore.getState().players)
                .map((player) => player.name.trim().toLowerCase())
                .filter(Boolean)
        );
        const suggested = generateUniqueEnglishHeroNames(8).find((name) => !existingNames.has(name.toLowerCase()))
            ?? generateUniqueEnglishHeroNames(1)[0]
            ?? "";
        onBeforeOpenRecruit?.();
        setRenameOpen(false);
        setRenamePlayerId(null);
        setRenameHeroName("");
        setNewHeroName(suggested);
        setRecruitOpen(true);
    }, [onBeforeOpenRecruit]);

    const createHero = useCallback(() => {
        const trimmed = newHeroName.trim().slice(0, 20);
        if (!trimmed) {
            return;
        }
        gameStore.dispatch({ type: "addPlayer", name: trimmed });
        closeRecruit();
    }, [closeRecruit, newHeroName]);

    const closeRename = useCallback(() => {
        setRenameOpen(false);
        setRenamePlayerId(null);
        setRenameHeroName("");
    }, []);

    const openActiveRename = useCallback(() => {
        const state = gameStore.getState();
        const playerId = state.activePlayerId;
        if (!playerId) {
            return;
        }
        const player = state.players[playerId];
        if (!player) {
            return;
        }

        onBeforeOpenRename?.();
        setRecruitOpen(false);
        setNewHeroName("");
        setRenamePlayerId(playerId);
        setRenameHeroName(player.name);
        setRenameOpen(true);
    }, [onBeforeOpenRename]);

    const renameHero = useCallback(() => {
        if (!renamePlayerId) {
            return;
        }
        const trimmed = renameHeroName.trim().slice(0, 20);
        if (!trimmed) {
            return;
        }
        gameStore.dispatch({ type: "renamePlayer", playerId: renamePlayerId, name: trimmed });
        closeRename();
    }, [closeRename, renameHeroName, renamePlayerId]);

    const closeAllHeroNameModals = useCallback(() => {
        closeRecruit();
        closeRename();
    }, [closeRecruit, closeRename]);

    return {
        isRecruitOpen,
        newHeroName,
        setNewHeroName,
        openRecruit,
        closeRecruit,
        createHero,
        isRenameOpen,
        renameHeroName,
        setRenameHeroName,
        openActiveRename,
        closeRename,
        renameHero,
        closeAllHeroNameModals,
    };
};
