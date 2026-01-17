import { getActionDefinition } from "../data/definitions";
import { XP_NEXT_MULTIPLIER } from "./constants";
import { GameState, PlayerId, PlayerState, RecipeState, SkillState } from "./types";

const clampProgress = (value: number): number => {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(100, value));
};

type LevelState = Pick<SkillState, "xp" | "xpNext" | "level" | "maxLevel">;

const applyLevelUps = <T extends LevelState>(entity: T): T => {
    let xp = entity.xp;
    let xpNext = entity.xpNext;
    let level = entity.level;

    while (xp >= xpNext && level < entity.maxLevel) {
        xp -= xpNext;
        level += 1;
        xpNext = Math.floor(xpNext * XP_NEXT_MULTIPLIER);
    }

    return {
        ...entity,
        xp,
        xpNext,
        level
    };
};

const applyActionTick = (player: PlayerState, deltaMs: number, timestamp: number): PlayerState => {
    if (!player.selectedActionId) {
        return player;
    }

    const actionDef = getActionDefinition(player.selectedActionId);
    if (!actionDef) {
        return player;
    }

    const skill = player.skills[actionDef.skillId];
    if (!skill) {
        return player;
    }

    const selectedRecipeId = skill.selectedRecipeId;
    if (!selectedRecipeId) {
        return player;
    }

    const recipe = skill.recipes[selectedRecipeId];
    if (!recipe) {
        return player;
    }

    const actionInterval = skill.baseInterval + (player.stamina <= 0 ? actionDef.stunTime : 0);
    if (actionInterval <= 0) {
        return player;
    }

    let currentInterval = player.actionProgress.currentInterval + deltaMs;
    const completedActions = Math.floor(currentInterval / actionInterval);
    currentInterval %= actionInterval;

    let nextPlayer = { ...player };
    let nextSkill: SkillState = { ...skill };
    let nextRecipe: RecipeState = { ...recipe };

    if (completedActions > 0) {
        let stamina = nextPlayer.stamina;
        let gold = nextPlayer.storage.gold;

        for (let i = 0; i < completedActions; i += 1) {
            if (stamina <= 0) {
                stamina = nextPlayer.staminaMax;
            }
            gold += actionDef.goldReward;
            stamina -= actionDef.staminaCost;
            nextSkill = { ...nextSkill, xp: nextSkill.xp + actionDef.xpSkill };
            nextRecipe = { ...nextRecipe, xp: nextRecipe.xp + actionDef.xpRecipe };
            nextSkill = applyLevelUps(nextSkill);
            nextRecipe = applyLevelUps(nextRecipe);
        }

        nextPlayer = {
            ...nextPlayer,
            stamina,
            storage: {
                ...nextPlayer.storage,
                gold
            }
        };
    }

    const progressPercent = clampProgress((currentInterval / actionInterval) * 100);
    const nextSkills = {
        ...nextPlayer.skills,
        [nextSkill.id]: {
            ...nextSkill,
            recipes: {
                ...nextSkill.recipes,
                [nextRecipe.id]: nextRecipe
            }
        }
    };

    return {
        ...nextPlayer,
        skills: nextSkills,
        actionProgress: {
            currentInterval,
            progressPercent,
            lastExecutionTime: completedActions > 0 ? timestamp : nextPlayer.actionProgress.lastExecutionTime
        }
    };
};

export const applyTick = (state: GameState, deltaMs: number, timestamp: number): GameState => {
    const players = Object.keys(state.players).reduce<Record<PlayerId, PlayerState>>((acc, id) => {
        const player = state.players[id];
        acc[id] = applyActionTick(player, deltaMs, timestamp);
        return acc;
    }, {});

    return {
        ...state,
        players,
        loop: {
            ...state.loop,
            lastTick: timestamp
        }
    };
};
