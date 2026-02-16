import { memo, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { ActionId, ItemId, PlayerState, RecipeDefinition, SkillDefinition, SkillId, SkillState } from "../../core/types";
import { getRecipeUnlockLevel, getRecipesForSkill, isRecipeUnlocked, ITEM_DEFINITIONS } from "../../data/definitions";
import { getEquipmentDefinition } from "../../data/equipment";
import { RECIPE_MAX_LEVEL, SKILL_MAX_LEVEL } from "../../core/constants";
import { StartActionIcon } from "../ui/startActionIcon";
import { InterruptIcon } from "../ui/interruptIcon";
import { BackIcon } from "../ui/backIcon";
import { ResumeIcon } from "../ui/resumeIcon";
import { SkillIcon } from "../ui/skillIcons";
import { getSkillIconColor } from "../ui/skillColors";
import { formatItemListEntries, formatItemListEntriesFull, getItemListEntries } from "../ui/itemFormatters";
import { ItemIcon } from "../ui/itemIcon";
import { formatNumberCompact } from "../ui/numberFormatters";
import { ModalShell } from "./ModalShell";

type ItemEntry = {
    id: string;
    name: string;
    amount: number;
};

type RecipeChoice = {
    recipeDef: RecipeDefinition;
    unlockLevel: number;
    unlocked: boolean;
    recipeLevel: number;
    recipeXp: number;
    recipeXpNext: number;
    recipeMax: number;
    recipeXpLabel: string;
    consumptionEntries: ItemEntry[];
    productionEntries: ItemEntry[];
    equipableItemId: ItemId | null;
    consumptionLabel: string;
    productionLabel: string;
    consumptionFullLabel: string;
    productionFullLabel: string;
    ownedEntries: ItemEntry[];
    ownedLabel: string;
    ownedFullLabel: string;
};

type SkillChoice = {
    skill: SkillDefinition & { id: ActionId };
    level: number;
    xpLabel: string;
    maxLevel: number;
    color: string;
};

type ActionSelectionScreenProps = {
    activePlayer: PlayerState;
    skills: Array<SkillDefinition & { id: ActionId }>;
    pendingSkillId: ActionId | "";
    pendingRecipeId: string;
    pendingSkill: SkillState | null;
    pendingSkillLabel: string;
    pendingRecipeLabel: string;
    pendingConsumptionLabel: string;
    pendingProductionLabel: string;
    inventoryItems: Record<string, number>;
    pendingConsumptionEntries: ItemEntry[];
    pendingProductionEntries: ItemEntry[];
    pendingSpeedBonusLabel: string;
    pendingSpeedBonusTooltip: string;
    pendingActionDurationLabel: string;
    pendingActionXpLabel: string;
    pendingXpBonusLabel: string;
    pendingXpBonusTooltip: string;
    pendingStunTimeLabel: string | null;
    missingItemsLabel: string;
    canStartAction: boolean;
    canStopAction: boolean;
    canReselect?: boolean;
    showReselect?: boolean;
    onSkillSelect: (skillId: ActionId | "") => void;
    onRecipeSelect: (recipeId: string) => void;
    onStartAction: () => void;
    onStopAction: () => void;
    onReselect?: () => void;
    onBack: () => void;
};

export const ActionSelectionScreen = memo(({
    activePlayer,
    skills,
    pendingSkillId,
    pendingRecipeId,
    pendingSkill,
    pendingSkillLabel,
    pendingRecipeLabel,
    pendingConsumptionLabel,
    pendingProductionLabel,
    inventoryItems,
    pendingConsumptionEntries,
    pendingProductionEntries,
    pendingSpeedBonusLabel,
    pendingSpeedBonusTooltip,
    pendingActionDurationLabel,
    pendingActionXpLabel,
    pendingXpBonusLabel,
    pendingXpBonusTooltip,
    pendingStunTimeLabel,
    missingItemsLabel,
    canStartAction,
    canStopAction,
    canReselect = false,
    showReselect = false,
    onSkillSelect,
    onRecipeSelect,
    onStartAction,
    onStopAction,
    onReselect,
    onBack
}: ActionSelectionScreenProps) => {
    const [isSkillModalOpen, setSkillModalOpen] = useState(false);
    const [isRecipeModalOpen, setRecipeModalOpen] = useState(false);
    const currentActionId = activePlayer.selectedActionId ?? "";
    const currentRecipeId = currentActionId ? activePlayer.skills[currentActionId]?.selectedRecipeId ?? "" : "";
    const isSameRecipeSelected = Boolean(
        pendingSkillId &&
        pendingRecipeId &&
        pendingSkillId === currentActionId &&
        pendingRecipeId === currentRecipeId
    );
    const startActionClassName = [
        "ts-collapse-button",
        "ts-focusable",
        "ts-action-start",
        canStartAction ? (isSameRecipeSelected ? "is-ready-same" : "is-ready-new") : ""
    ].filter(Boolean).join(" ");
    const renderItemSummary = (
        entries: ItemEntry[],
        fallbackLabel: string,
        tone: "consume" | "produce"
    ) => {
        if (entries.length === 0) {
            return fallbackLabel;
        }
        const fullLabel = formatItemListEntriesFull(entries);
        return (
            <span className="ts-item-inline-list" title={fullLabel}>
                {entries.map((entry, index) => (
                    <span key={entry.id} className="ts-item-inline">
                        {formatNumberCompact(entry.amount)} {entry.name}
                        <ItemIcon itemId={entry.id} tone={tone} />
                        {index < entries.length - 1 ? ", " : null}
                    </span>
                ))}
            </span>
        );
    };

    const getSkillProgressStyle = (skillId: SkillId | ""): CSSProperties => {
        if (!skillId) {
            return {
                "--ts-skill-progress": "0%",
                "--ts-skill-progress-color": "rgba(93, 217, 193, 0.12)"
            } as CSSProperties;
        }
        const state = activePlayer.skills[skillId];
        if (!state) {
            return {};
        }
        const progress = state.maxLevel > 0 && state.level >= state.maxLevel
            ? 1
            : state.xpNext > 0
                ? state.xp / state.xpNext
                : 0;
        const percent = `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`;
        const color = getSkillIconColor(skillId);
        const progressColor = color.startsWith("#") && color.length === 7
            ? `${color}33`
            : "rgba(93, 217, 193, 0.2)";
        return {
            "--ts-skill-progress": percent,
            "--ts-skill-progress-color": progressColor
        } as CSSProperties;
    };

    const getRecipeProgressStyle = (xp: number, xpNext: number, isUnlocked: boolean): CSSProperties => {
        if (!isUnlocked) {
            return {
                "--ts-recipe-progress": "0%",
                "--ts-recipe-progress-color": "rgba(93, 217, 193, 0.12)"
            } as CSSProperties;
        }
        const progress = xpNext > 0 ? xp / xpNext : 0;
        const percent = `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`;
        const color = getSkillIconColor(pendingSkillId as SkillId);
        const progressColor = color.startsWith("#") && color.length === 7
            ? `${color}33`
            : "rgba(93, 217, 193, 0.2)";
        return {
            "--ts-recipe-progress": percent,
            "--ts-recipe-progress-color": progressColor
        } as CSSProperties;
    };

    const formatSummaryValue = (value: string | null | undefined): string => {
        if (!value || value === "None") {
            return "-";
        }
        return value;
    };

    const pendingOwnedEntries = useMemo<ItemEntry[]>(() => {
        if (!pendingSkillId || !pendingRecipeId || pendingProductionEntries.length === 0) {
            return [];
        }
        return pendingProductionEntries.map((entry) => {
            const rawCount = inventoryItems[entry.id];
            const ownedAmount = Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount as number)) : 0;
            return {
                id: entry.id,
                name: entry.name,
                amount: ownedAmount
            };
        });
    }, [inventoryItems, pendingProductionEntries, pendingRecipeId, pendingSkillId]);

    const pendingOwnedLabel = useMemo(
        () => (pendingOwnedEntries.length > 0 ? formatItemListEntries(pendingOwnedEntries) : "None"),
        [pendingOwnedEntries]
    );

    const skillChoices = useMemo<SkillChoice[]>(() => {
        return skills.map((skill) => {
            const skillLevel = activePlayer?.skills[skill.id]?.level ?? 0;
            const skillXp = activePlayer?.skills[skill.id]?.xp ?? 0;
            const skillXpNext = activePlayer?.skills[skill.id]?.xpNext ?? 0;
            const skillMax = activePlayer?.skills[skill.id]?.maxLevel ?? SKILL_MAX_LEVEL;
            const xpCurrent = Number.isFinite(skillXp) ? Math.round(skillXp) : 0;
            const xpNextValue = Number.isFinite(skillXpNext) ? Math.round(skillXpNext) : 0;
            const xpLabel = `XP ${xpCurrent}/${xpNextValue}`;
            return {
                skill,
                level: skillLevel,
                xpLabel,
                maxLevel: skillMax,
                color: getSkillIconColor(skill.id)
            };
        });
    }, [activePlayer, skills]);

    const selectedSkillChoice = useMemo(() => {
        if (!pendingSkillId) {
            return null;
        }
        return skillChoices.find((choice) => choice.skill.id === pendingSkillId) ?? null;
    }, [pendingSkillId, skillChoices]);

    const recipeChoices = useMemo<RecipeChoice[]>(() => {
        if (!pendingSkill || !pendingSkillId) {
            return [];
        }
        return getRecipesForSkill(pendingSkillId as SkillId)
            .map((recipeDef, index) => ({
                recipeDef,
                index,
                unlockLevel: getRecipeUnlockLevel(recipeDef)
            }))
            .sort((a, b) => (a.unlockLevel - b.unlockLevel) || (a.index - b.index))
            .map(({ recipeDef, unlockLevel }) => {
                const recipeState = pendingSkill.recipes[recipeDef.id];
                const recipeLevel = recipeState?.level ?? 0;
                const recipeXp = recipeState?.xp ?? 0;
                const recipeXpNext = recipeState?.xpNext ?? 0;
                const recipeMax = recipeState?.maxLevel ?? RECIPE_MAX_LEVEL;
                const unlocked = isRecipeUnlocked(recipeDef, pendingSkill.level);
                const recipeXpLabel = `XP ${Number.isFinite(recipeXp) ? Math.round(recipeXp) : 0}/${Number.isFinite(recipeXpNext) ? Math.round(recipeXpNext) : 0}`;
                const consumptionEntries = getItemListEntries(ITEM_DEFINITIONS, recipeDef.itemCosts);
                const productionEntries = getItemListEntries(ITEM_DEFINITIONS, recipeDef.itemRewards);
                const equipableEntry = productionEntries.find((entry) => getEquipmentDefinition(entry.id));
                const equipableItemId = (equipableEntry?.id ?? null) as ItemId | null;
                const consumptionLabel = consumptionEntries.length > 0
                    ? formatItemListEntries(consumptionEntries)
                    : "None";
                const productionLabel = productionEntries.length > 0
                    ? formatItemListEntries(productionEntries)
                    : "None";
                const consumptionFullLabel = consumptionEntries.length > 0
                    ? formatItemListEntriesFull(consumptionEntries)
                    : consumptionLabel;
                const productionFullLabel = productionEntries.length > 0
                    ? formatItemListEntriesFull(productionEntries)
                    : productionLabel;
                const ownedEntries = productionEntries.map((entry) => {
                    const rawCount = inventoryItems[entry.id];
                    const ownedAmount = Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount as number)) : 0;
                    return {
                        id: entry.id,
                        name: entry.name,
                        amount: ownedAmount
                    };
                });
                const ownedLabel = ownedEntries.length > 0
                    ? formatItemListEntries(ownedEntries)
                    : "None";
                const ownedFullLabel = ownedEntries.length > 0
                    ? formatItemListEntriesFull(ownedEntries)
                    : ownedLabel;
                return {
                    recipeDef,
                    unlockLevel,
                    unlocked,
                    recipeLevel,
                    recipeXp,
                    recipeXpNext,
                    recipeMax,
                    recipeXpLabel,
                    consumptionEntries,
                    productionEntries,
                    equipableItemId,
                    consumptionLabel,
                    productionLabel,
                    consumptionFullLabel,
                    productionFullLabel,
                    ownedEntries,
                    ownedLabel,
                    ownedFullLabel
                };
            });
    }, [inventoryItems, pendingSkill, pendingSkillId]);

    const selectedRecipeChoice = useMemo(() => {
        if (recipeChoices.length === 0) {
            return null;
        }
        return recipeChoices.find((choice) => choice.recipeDef.id === pendingRecipeId)
            ?? recipeChoices.find((choice) => choice.unlocked)
            ?? recipeChoices[0];
    }, [pendingRecipeId, recipeChoices]);

    const unlockedRecipeCount = useMemo(
        () => recipeChoices.filter((choice) => choice.unlocked).length,
        [recipeChoices]
    );

    useEffect(() => {
        if (!pendingSkillId || !pendingSkill || recipeChoices.length === 0) {
            setRecipeModalOpen(false);
        }
    }, [pendingSkillId, pendingSkill, recipeChoices.length]);

    useEffect(() => {
        if (!activePlayer || skillChoices.length === 0) {
            setSkillModalOpen(false);
        }
    }, [activePlayer, skillChoices.length]);

    const handleSkillSelect = (skillId: ActionId | "") => {
        onSkillSelect(skillId);
        setSkillModalOpen(false);
        setRecipeModalOpen(false);
    };

    const handleRecipeSelect = (recipeId: string) => {
        onRecipeSelect(recipeId);
        setRecipeModalOpen(false);
    };

    const renderRecipeChoiceCardContent = (choice: RecipeChoice) => {
        return (
            <div className="ts-choice-copy">
                <div className="ts-choice-title ts-choice-title--recipe">
                    <span className="ts-choice-title-text">{choice.recipeDef.name}</span>
                    {choice.equipableItemId ? (
                        <ItemIcon itemId={choice.equipableItemId} tone="produce" size={14} />
                    ) : null}
                </div>
                {!choice.unlocked ? (
                    <div className="ts-choice-subtitle">Unlocks at Lv {choice.unlockLevel}</div>
                ) : (
                    <div className="ts-choice-subtitle">{choice.recipeXpLabel} · Lv {choice.recipeLevel}/{choice.recipeMax}</div>
                )}
                <div className="ts-choice-details" aria-hidden="true">
                    <div className="ts-choice-detail-row">
                        <span className="ts-choice-detail-label">
                            <span className="ts-choice-detail-label-full">Consumes</span>
                            <span className="ts-choice-detail-label-short">Cons</span>
                        </span>
                        <span className="ts-choice-detail-value">
                            {choice.consumptionEntries.length > 0 ? (
                                <span className="ts-item-inline-list" title={choice.consumptionFullLabel}>
                                    {choice.consumptionEntries.map((entry, index) => (
                                        <span key={entry.id} className="ts-item-inline">
                                            {formatNumberCompact(entry.amount)} {entry.name}
                                            <ItemIcon itemId={entry.id} tone="consume" />
                                            {index < choice.consumptionEntries.length - 1 ? ", " : null}
                                        </span>
                                    ))}
                                </span>
                            ) : choice.consumptionLabel}
                        </span>
                    </div>
                    <div className="ts-choice-detail-row">
                        <span className="ts-choice-detail-label">
                            <span className="ts-choice-detail-label-full">Produces</span>
                            <span className="ts-choice-detail-label-short">Prod</span>
                        </span>
                        <span className="ts-choice-detail-value">
                            {choice.productionEntries.length > 0 ? (
                                <span className="ts-item-inline-list" title={choice.productionFullLabel}>
                                    {choice.productionEntries.map((entry, index) => (
                                        <span key={entry.id} className="ts-item-inline">
                                            {formatNumberCompact(entry.amount)} {entry.name}
                                            <ItemIcon itemId={entry.id} tone="produce" />
                                            {index < choice.productionEntries.length - 1 ? ", " : null}
                                        </span>
                                    ))}
                                </span>
                            ) : choice.productionLabel}
                        </span>
                    </div>
                    <div className="ts-choice-detail-row">
                        <span className="ts-choice-detail-label">
                            <span className="ts-choice-detail-label-full">Owned</span>
                            <span className="ts-choice-detail-label-short">Own</span>
                        </span>
                        <span className="ts-choice-detail-value">
                            {choice.ownedEntries.length > 0 ? (
                                <span className="ts-item-inline-list" title={choice.ownedFullLabel}>
                                    {choice.ownedEntries.map((entry, index) => (
                                        <span key={entry.id} className="ts-item-inline">
                                            {formatNumberCompact(entry.amount)} {entry.name}
                                            <ItemIcon itemId={entry.id} tone="produce" />
                                            {index < choice.ownedEntries.length - 1 ? ", " : null}
                                        </span>
                                    ))}
                                </span>
                            ) : choice.ownedLabel}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <section className="generic-panel ts-panel ts-action-selection-panel">
                <div className="ts-panel-header">
                    <div className="ts-panel-heading">
                        <h2 className="ts-panel-title">Action</h2>
                    </div>
                    <div className="ts-panel-actions ts-panel-actions-inline">
                        {showReselect ? (
                            <button
                                type="button"
                                className={`ts-collapse-button ts-focusable ts-action-resume ts-action-button${canReselect ? " is-ready-active" : ""}`}
                                onClick={onReselect}
                                disabled={!canReselect}
                                aria-label="Re-select"
                                title="Re-select"
                            >
                                <span className="ts-collapse-label">
                                    <ResumeIcon />
                                </span>
                                <span className="ts-action-button-label">Re-select</span>
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className={`${startActionClassName} ts-action-button`}
                                    onClick={onStartAction}
                                    disabled={!canStartAction}
                                    aria-label="Start action"
                                    title="Start action"
                                >
                                    <span className="ts-collapse-label">
                                        <StartActionIcon />
                                    </span>
                                    <span className="ts-action-button-label">Start</span>
                                </button>
                                <button
                                    type="button"
                                    className={`ts-collapse-button ts-focusable ts-action-stop ts-action-button${canStopAction ? " is-ready-stop" : ""}`}
                                    onClick={onStopAction}
                                    disabled={!canStopAction}
                                    aria-label="Interrupt"
                                    title="Interrupt"
                                >
                                    <span className="ts-collapse-label">
                                        <InterruptIcon />
                                    </span>
                                    <span className="ts-action-button-label">Interrupt</span>
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            className="ts-collapse-button ts-focusable ts-action-button"
                            onClick={onBack}
                            aria-label="Back"
                            title="Back"
                        >
                            <span className="ts-collapse-label">
                                <BackIcon />
                            </span>
                            <span className="ts-action-button-label">Back</span>
                        </button>
                    </div>
                </div>
                <div className="ts-action-selection-layout">
                    {pendingSkillId && pendingRecipeId ? (
                        <div className="ts-action-selection-summary-panel">
                            <div className="ts-action-summary">
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">Action</span>
                                    <span className="ts-action-summary-value">{formatSummaryValue(pendingSkillLabel)}</span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">Recipe</span>
                                    <span className="ts-action-summary-value">{formatSummaryValue(pendingRecipeLabel)}</span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">Action time</span>
                                    <span className="ts-action-summary-value">{formatSummaryValue(pendingActionDurationLabel)}</span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">Speed bonus</span>
                                    <span className="ts-action-summary-value" title={pendingSpeedBonusTooltip}>
                                        {formatSummaryValue(pendingSpeedBonusLabel)}
                                    </span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">XP per action</span>
                                    <span className="ts-action-summary-value">{formatSummaryValue(pendingActionXpLabel)}</span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">XP bonus</span>
                                    <span className="ts-action-summary-value" title={pendingXpBonusTooltip}>
                                        {formatSummaryValue(pendingXpBonusLabel)}
                                    </span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">Consumes</span>
                                    <span className="ts-action-summary-value">
                                        {renderItemSummary(
                                            pendingConsumptionEntries,
                                            formatSummaryValue(pendingConsumptionLabel),
                                            "consume"
                                        )}
                                    </span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">Produces</span>
                                    <span className="ts-action-summary-value">
                                        {renderItemSummary(
                                            pendingProductionEntries,
                                            formatSummaryValue(pendingProductionLabel),
                                            "produce"
                                        )}
                                    </span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">Stun time</span>
                                    <span className="ts-action-summary-value">{formatSummaryValue(pendingStunTimeLabel)}</span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">Owned</span>
                                    <span className="ts-action-summary-value">
                                        {renderItemSummary(
                                            pendingOwnedEntries,
                                            formatSummaryValue(pendingOwnedLabel),
                                            "produce"
                                        )}
                                    </span>
                                </div>
                            </div>
                            {missingItemsLabel ? (
                                <div className="ts-missing-hint">{missingItemsLabel}</div>
                            ) : null}
                        </div>
                    ) : null}
                    <div className="ts-action-selection-column ts-action-selection-column--skills">
                        <fieldset className="ts-picker">
                            <legend className="ts-picker-legend">Select skill</legend>
                            <div className="ts-choice">
                                <button
                                    type="button"
                                    className="ts-choice-card ts-skill-choice ts-choice-card-button ts-focusable"
                                    style={getSkillProgressStyle(selectedSkillChoice?.skill.id ?? "")}
                                    onClick={() => {
                                        setSkillModalOpen(true);
                                        setRecipeModalOpen(false);
                                    }}
                                    aria-label="Select skill"
                                    title="Select skill"
                                >
                                    <div className="ts-choice-icon" aria-hidden="true">
                                        <SkillIcon
                                            skillId={selectedSkillChoice?.skill.id ?? ""}
                                            color={selectedSkillChoice?.color ?? getSkillIconColor("")}
                                        />
                                    </div>
                                    <div className="ts-choice-copy">
                                        <div className="ts-choice-title">
                                            {selectedSkillChoice ? selectedSkillChoice.skill.name : "Choose a path"}
                                        </div>
                                        <div className="ts-choice-subtitle">
                                            {selectedSkillChoice ? selectedSkillChoice.xpLabel : "No skill selected"}
                                        </div>
                                    </div>
                                    <div className="ts-choice-meta ts-choice-meta--skill-trigger">
                                        {selectedSkillChoice ? (
                                            <div className="ts-choice-level">
                                                <span className="ts-choice-level-value">{selectedSkillChoice.level}</span>
                                                <span className="ts-choice-level-max">/{selectedSkillChoice.maxLevel}</span>
                                            </div>
                                        ) : null}
                                        <div className="ts-choice-xp">{skills.length} actions</div>
                                        <div className="ts-choice-subtitle">Open selector</div>
                                    </div>
                                </button>
                            </div>
                        </fieldset>
                    </div>

                    <div className="ts-action-selection-column ts-action-selection-column--recipes">
                        <fieldset className="ts-picker">
                            <legend className="ts-picker-legend">Select recipe</legend>
                            {pendingSkill && pendingSkillId && selectedRecipeChoice ? (
                                <div className="ts-choice">
                                    <button
                                        type="button"
                                        className="ts-choice-card ts-recipe-choice ts-choice-card-button ts-focusable"
                                        style={getRecipeProgressStyle(
                                            selectedRecipeChoice.recipeXp,
                                            selectedRecipeChoice.recipeXpNext,
                                            selectedRecipeChoice.unlocked
                                        )}
                                        onClick={() => setRecipeModalOpen(true)}
                                        aria-label="Select recipe"
                                        title="Select recipe"
                                    >
                                        {renderRecipeChoiceCardContent(selectedRecipeChoice)}
                                        <div className="ts-choice-meta ts-choice-meta--recipe-trigger">
                                            <div className="ts-choice-xp">{unlockedRecipeCount}/{recipeChoices.length} unlocked</div>
                                            <div className="ts-choice-subtitle">Open selector</div>
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <div className="ts-picker-empty ts-picker-empty--pulse">Choose a skill to see recipes.</div>
                            )}
                        </fieldset>
                    </div>
                </div>
            </section>

            {isSkillModalOpen ? (
                <ModalShell
                    title="Select action"
                    kicker="Actions"
                    onClose={() => setSkillModalOpen(false)}
                >
                    <div className="ts-action-selection-skill-modal">
                        <div className="ts-skill-picker ts-action-selection-skill-modal-list" role="radiogroup" aria-label="Select skill">
                            <label className="ts-choice">
                                <input
                                    className="ts-choice-input"
                                    type="radio"
                                    name="pending-skill"
                                    value=""
                                    checked={pendingSkillId === ""}
                                    onChange={() => handleSkillSelect("")}
                                />
                                <div className="ts-choice-card ts-skill-choice" style={getSkillProgressStyle("")}>
                                    <div className="ts-choice-icon" aria-hidden="true">
                                        <SkillIcon skillId="" color={getSkillIconColor("")} />
                                    </div>
                                    <div className="ts-choice-copy">
                                        <div className="ts-choice-title">Choose a path</div>
                                        <div className="ts-choice-subtitle">No skill selected</div>
                                    </div>
                                </div>
                            </label>
                            {skillChoices.map((choice) => (
                                <label key={choice.skill.id} className="ts-choice">
                                    <input
                                        className="ts-choice-input"
                                        type="radio"
                                        name="pending-skill"
                                        value={choice.skill.id}
                                        checked={pendingSkillId === choice.skill.id}
                                        onChange={() => handleSkillSelect(choice.skill.id)}
                                    />
                                    <div className="ts-choice-card ts-skill-choice" style={getSkillProgressStyle(choice.skill.id)}>
                                        <div className="ts-choice-icon" aria-hidden="true">
                                            <SkillIcon skillId={choice.skill.id} color={choice.color} />
                                        </div>
                                        <div className="ts-choice-copy">
                                            <div className="ts-choice-title">{choice.skill.name}</div>
                                        </div>
                                        <div className="ts-choice-meta">
                                            <div className="ts-choice-level">
                                                <span className="ts-choice-level-value">{choice.level}</span>
                                                <span className="ts-choice-level-max">/{choice.maxLevel}</span>
                                            </div>
                                            <div className="ts-choice-xp">{choice.xpLabel}</div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </ModalShell>
            ) : null}

            {isRecipeModalOpen && pendingSkill && pendingSkillId ? (
                <ModalShell
                    title="Select recipe"
                    kicker={pendingSkillLabel || "Action"}
                    onClose={() => setRecipeModalOpen(false)}
                >
                    <div className="ts-action-selection-recipe-modal">
                        <div className="ts-recipe-picker ts-action-selection-recipe-modal-list" role="radiogroup" aria-label="Select recipe">
                            {recipeChoices.map((choice) => (
                                <label key={choice.recipeDef.id} className="ts-choice">
                                    <input
                                        className="ts-choice-input"
                                        type="radio"
                                        name="pending-recipe"
                                        value={choice.recipeDef.id}
                                        checked={pendingRecipeId === choice.recipeDef.id}
                                        disabled={!choice.unlocked}
                                        onChange={() => handleRecipeSelect(choice.recipeDef.id)}
                                    />
                                    <div
                                        className="ts-choice-card ts-recipe-choice"
                                        style={getRecipeProgressStyle(choice.recipeXp, choice.recipeXpNext, choice.unlocked)}
                                    >
                                        {renderRecipeChoiceCardContent(choice)}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </ModalShell>
            ) : null}
        </>
    );
});

ActionSelectionScreen.displayName = "ActionSelectionScreen";
