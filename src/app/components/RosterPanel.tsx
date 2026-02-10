import { memo, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import type { PlayerState } from "../../core/types";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType } from "../../data/equipment";
import { getSkillIconColor } from "../ui/skillColors";
import { getFaceIndex, getFaceUrlByIndex } from "../ui/heroFaces";
import { getHairColor, getHairIndex, getHairUrlByIndex, getSkinColor } from "../ui/heroHair";
import { SkillIcon } from "../ui/skillIcons";
import { CollapseIcon } from "../ui/collapseIcon";
import { SystemIcon } from "../ui/systemIcon";
import { getEquipmentSkinVars } from "../ui/heroEquipmentSkins";
import { Avatar } from "./Avatar";

type RosterPanelProps = {
    players: PlayerState[];
    activePlayerId: string | null;
    activeDungeonPartyPlayerIds: string[];
    rosterLimit: number;
    isCollapsed: boolean;
    showCollapseButton: boolean;
    showSettingsButton: boolean;
    onToggleCollapsed: () => void;
    onSetActivePlayer: (playerId: string) => void;
    onReorderPlayer: (playerId: string, targetIndex: number) => void;
    onAddPlayer: () => void;
    onOpenSystem: () => void;
    getSkillLabel: (skillId: string) => string;
    getRecipeLabel: (skillId: string, recipeId: string) => string;
};

const DRAG_THRESHOLD_PX = 8;
const LONG_PRESS_MS = 500;

const movePlayerInList = (list: PlayerState[], playerId: string, targetIndex: number) => {
    const fromIndex = list.findIndex((player) => player.id === playerId);
    if (fromIndex === -1) {
        return list;
    }
    const clampedIndex = Math.max(0, Math.min(list.length, targetIndex));
    if (fromIndex === clampedIndex) {
        return list;
    }
    const next = list.slice();
    const [moved] = next.splice(fromIndex, 1);
    const adjustedIndex = clampedIndex > fromIndex ? clampedIndex - 1 : clampedIndex;
    next.splice(adjustedIndex, 0, moved);
    return next;
};

type DragState = {
    playerId: string;
    overIndex: number;
    isDragging: boolean;
};

type DragTracking = {
    playerId: string;
    fromIndex: number;
    overIndex: number;
    pointerId: number;
    startX: number;
    startY: number;
    isDragging: boolean;
    isArmed: boolean;
    pointerType: string;
    longPressTimer: number | null;
};

export const RosterPanel = memo(({
    players,
    activePlayerId,
    activeDungeonPartyPlayerIds,
    rosterLimit,
    isCollapsed,
    showCollapseButton,
    showSettingsButton,
    onToggleCollapsed,
    onSetActivePlayer,
    onReorderPlayer,
    onAddPlayer,
    onOpenSystem,
    getSkillLabel,
    getRecipeLabel
}: RosterPanelProps) => {
    const rosterCount = players.length;
    const canAddPlayer = rosterCount < rosterLimit;
    const activeDungeonPartySet = new Set(activeDungeonPartyPlayerIds);
    const combatLabelBySkillId: Partial<Record<string, string>> = {
        CombatMelee: "Melee",
        CombatRanged: "Ranged",
        CombatMagic: "Magic"
    };
    const [dragState, setDragState] = useState<DragState | null>(null);
    const dragRef = useRef<DragTracking | null>(null);
    const suppressClickRef = useRef<string | null>(null);
    const renderedPlayers = useMemo(() => {
        if (!dragState || !dragState.isDragging) {
            return players;
        }
        return movePlayerInList(players, dragState.playerId, dragState.overIndex);
    }, [players, dragState]);

    const clearDrag = () => {
        const tracking = dragRef.current;
        if (tracking?.longPressTimer) {
            window.clearTimeout(tracking.longPressTimer);
        }
        dragRef.current = null;
        setDragState(null);
    };

    const handlePointerDown = (
        event: PointerEvent<HTMLDivElement>,
        playerId: string,
        index: number
    ) => {
        if (event.button !== 0 && event.pointerType === "mouse") {
            return;
        }
        const target = event.target as HTMLElement;
        if (target.closest("[data-no-drag]")) {
            return;
        }
        const tracking: DragTracking = {
            playerId,
            fromIndex: index,
            overIndex: index,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            isDragging: false,
            isArmed: event.pointerType !== "touch",
            pointerType: event.pointerType,
            longPressTimer: null
        };
        dragRef.current = tracking;
        if (typeof event.currentTarget.setPointerCapture === "function") {
            event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (event.pointerType === "touch") {
            tracking.longPressTimer = window.setTimeout(() => {
                if (!dragRef.current || dragRef.current.playerId !== playerId) {
                    return;
                }
                dragRef.current.isArmed = true;
                suppressClickRef.current = playerId;
            }, LONG_PRESS_MS);
        }
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const tracking = dragRef.current;
        if (!tracking || tracking.pointerId !== event.pointerId) {
            return;
        }
        const dx = event.clientX - tracking.startX;
        const dy = event.clientY - tracking.startY;
        const distance = Math.hypot(dx, dy);
        if (!tracking.isDragging) {
            if (!tracking.isArmed || distance < DRAG_THRESHOLD_PX) {
                return;
            }
            tracking.isDragging = true;
            tracking.overIndex = tracking.fromIndex;
            setDragState({ playerId: tracking.playerId, overIndex: tracking.overIndex, isDragging: true });
        }
        event.preventDefault();
        const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
        const card = element?.closest("[data-roster-player-id]") as HTMLElement | null;
        const overId = card?.dataset.rosterPlayerId ?? null;
        if (!overId) {
            return;
        }
        const baseIndex = players.findIndex((player) => player.id === overId);
        if (baseIndex === -1) {
            return;
        }
        const rect = card?.getBoundingClientRect();
        const after = rect ? event.clientY > rect.top + rect.height / 2 : false;
        const targetIndex = Math.max(0, Math.min(players.length, baseIndex + (after ? 1 : 0)));
        if (targetIndex === tracking.overIndex) {
            return;
        }
        tracking.overIndex = targetIndex;
        setDragState({ playerId: tracking.playerId, overIndex: targetIndex, isDragging: true });
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        const tracking = dragRef.current;
        if (!tracking || tracking.pointerId !== event.pointerId) {
            return;
        }
        if (tracking.longPressTimer) {
            window.clearTimeout(tracking.longPressTimer);
        }
        if (tracking.isDragging) {
            suppressClickRef.current = tracking.playerId;
            onReorderPlayer(tracking.playerId, tracking.overIndex);
        } else if (tracking.pointerType === "touch" && tracking.isArmed) {
            suppressClickRef.current = tracking.playerId;
        }
        clearDrag();
    };

    return (
        <section className="generic-panel ts-panel" data-testid="roster-panel">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Roster</h2>
                    <span className="ts-panel-counter">{rosterCount}/{rosterLimit}</span>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    {showSettingsButton ? (
                        <button
                            type="button"
                            className="ts-icon-button ts-panel-action-button ts-focusable"
                            onClick={onOpenSystem}
                            aria-label="Open settings"
                        >
                            <span className="ts-panel-action-icon" aria-hidden="true">
                                <SystemIcon />
                            </span>
                        </button>
                    ) : null}
                    {showCollapseButton ? (
                        <button
                            type="button"
                            className="ts-collapse-button ts-focusable"
                            onClick={onToggleCollapsed}
                            aria-label={isCollapsed ? "Expand" : "Collapse"}
                        >
                            <span className="ts-collapse-label">
                                <CollapseIcon isCollapsed={isCollapsed} />
                            </span>
                        </button>
                    ) : null}
                </div>
            </div>
            {!isCollapsed ? (
                <>
                    <div className={`ts-player-list${dragState?.isDragging ? " is-dragging" : ""}`}>
                        {renderedPlayers.map((player, index) => {
                            const isAssignedToDungeon = activeDungeonPartySet.has(player.id);
                            const currentAction = player.selectedActionId;
                            const combatSkillId = getCombatSkillIdForWeaponType(getEquippedWeaponType(player.equipment));
                            const displaySkillId = isAssignedToDungeon ? combatSkillId : currentAction;
                            const currentSkill = displaySkillId ? player.skills[displaySkillId] : null;
                            const currentRecipe = currentSkill?.selectedRecipeId ?? null;
                            const combatLabel = displaySkillId ? combatLabelBySkillId[displaySkillId] : null;
                            const actionLabel = combatLabel ?? (displaySkillId ? getSkillLabel(displaySkillId) : "");
                            const recipeLabel = displaySkillId && currentRecipe
                                ? getRecipeLabel(displaySkillId, currentRecipe)
                                : null;
                            const metaLabel = isAssignedToDungeon ? "Dungeon run" : (recipeLabel ?? "No recipe");
                            const skillColor = getSkillIconColor(displaySkillId);
                            const skillLevel = displaySkillId ? currentSkill?.level ?? 0 : 0;
                            const isCombatLabel = Boolean(combatLabel);
                            const faceIndex = player.appearance?.faceIndex ?? getFaceIndex(player.id);
                            const hairIndex = player.appearance?.hairIndex ?? getHairIndex(player.id);
                            const hairColor = player.appearance?.hairColor ?? getHairColor(player.id);
                            const skinColor = player.appearance?.skinColor ?? getSkinColor(player.id);
                            const showHelmet = player.appearance?.showHelmet ?? true;
                            const avatarStyle = {
                                "--ts-avatar-torso": skillColor,
                                "--ts-avatar-face": `url("${getFaceUrlByIndex(faceIndex)}")`,
                                "--ts-avatar-hair": `url("${getHairUrlByIndex(hairIndex)}")`,
                                "--ts-avatar-hair-color": hairColor,
                                "--ts-avatar-skin": skinColor,
                                ...getEquipmentSkinVars(player.equipment, { showHelmet })
                            } as CSSProperties;

                            return (
                                <div
                                    key={player.id}
                                    className={`ts-player-card ${player.id === activePlayerId ? "is-active" : ""}${dragState?.playerId === player.id ? " is-dragging" : ""}`}
                                    onClick={() => {
                                        if (suppressClickRef.current === player.id) {
                                            suppressClickRef.current = null;
                                            return;
                                        }
                                        onSetActivePlayer(player.id);
                                    }}
                                    onPointerDown={(event) => handlePointerDown(event, player.id, index)}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerCancel={handlePointerUp}
                                    data-roster-player-id={player.id}
                                    data-testid={`roster-player-${player.id}`}
                                >
                                    <div className="ts-player-main">
                                    <Avatar style={avatarStyle} />
                                        <div className="ts-player-info">
                                            <span className="ts-player-name">{player.name}</span>
                                            <span className="ts-player-meta">{metaLabel}</span>
                                        </div>
                                    </div>
                                    {actionLabel ? (
                                        <div className="ts-player-skill">
                                            <span className="ts-player-skill-icon" aria-hidden="true">
                                                <SkillIcon skillId={displaySkillId ?? ""} color={skillColor} />
                                            </span>
                                            <span className={`ts-player-skill-label${isCombatLabel ? " is-combat" : ""}`}>
                                                {actionLabel}
                                                <span className={`ts-player-skill-badge${isCombatLabel ? " is-combat" : ""}`}>{skillLevel}</span>
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            className={`ts-player-card ts-player-card-add ts-focusable${canAddPlayer ? "" : " is-disabled"}`}
                            onClick={onAddPlayer}
                            disabled={!canAddPlayer}
                            aria-disabled={!canAddPlayer}
                            data-no-drag="true"
                            aria-label="Enlist a new hero"
                            title={!canAddPlayer ? "Roster limit reached" : undefined}
                        >
                            <div className="ts-player-main">
                                <Avatar isPlaceholder />
                                <div className="ts-player-info">
                                    <span className="ts-player-name">Enlist a new hero</span>
                                    <span className="ts-player-meta">Recruit a character</span>
                                </div>
                            </div>
                            <div className="ts-player-skill" aria-hidden="true">
                                <span className="ts-player-skill-label">+</span>
                            </div>
                        </button>
                    </div>
                </>
            ) : null}
        </section>
    );
});

RosterPanel.displayName = "RosterPanel";
