import { resolveDungeonRiskTier } from "../../../../core/dungeon";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType } from "../../../../data/equipment";
import type { DungeonDefinition, DungeonId, PlayerId, PlayerState } from "../../../../core/types";
import { SkillIcon } from "../../../ui/skillIcons";
import { getSkillIconColor } from "../../../ui/skillColors";

type DungeonSetupViewProps = {
    definitions: DungeonDefinition[];
    selectedDungeonId: string;
    safeCompletionCounts: Record<DungeonId, number>;
    usesPartyPower: boolean;
    currentPower: number;
    riskTooltip: string;
    onSelectDungeon: (dungeonId: string) => void;
    canEnterDungeon: boolean;
    sortedPlayers: PlayerState[];
    selectedPartyPlayerIds: PlayerId[];
    combatLabelBySkillId: Partial<Record<string, string>>;
    onTogglePartyPlayer: (playerId: PlayerId) => void;
    hasPartySelection: boolean;
    safeRequiredFoodForStart: number;
    safeFoodCount: number;
    hasEnoughFood: boolean;
};

export const DungeonSetupView = ({
    definitions,
    selectedDungeonId,
    safeCompletionCounts,
    usesPartyPower,
    currentPower,
    riskTooltip,
    onSelectDungeon,
    canEnterDungeon,
    sortedPlayers,
    selectedPartyPlayerIds,
    combatLabelBySkillId,
    onTogglePartyPlayer,
    hasPartySelection,
    safeRequiredFoodForStart,
    safeFoodCount,
    hasEnoughFood
}: DungeonSetupViewProps) => {
    return (
        <div className="ts-dungeon-setup-grid">
            <div className="ts-dungeon-card">
                <h3 className="ts-dungeon-card-title">1. Select dungeon</h3>
                <div className="ts-dungeon-list">
                    {definitions.map((definition) => {
                        const recommendedPower = definition.recommendedPower * 2;
                        const completionCount = safeCompletionCounts[definition.id] ?? 0;
                        const riskTier = usesPartyPower
                            ? resolveDungeonRiskTier(currentPower, recommendedPower)
                            : null;
                        const riskTone = riskTier ? riskTier.toLowerCase() : "medium";
                        return (
                            <button
                                key={definition.id}
                                type="button"
                                className={`ts-dungeon-option ts-focusable${selectedDungeonId === definition.id ? " is-active" : ""}`}
                                onClick={() => onSelectDungeon(definition.id)}
                            >
                                <strong>{definition.name}</strong>
                                <span className="ts-dungeon-option-subtitle">
                                    Tier {definition.tier} · {definition.floorCount} floors · Boss: {definition.bossName}
                                </span>
                                <div className="ts-dungeon-option-meta-row">
                                    <span className="ts-dungeon-option-subtitle">
                                        Recommended power: {recommendedPower.toLocaleString()}
                                    </span>
                                    {riskTier ? (
                                        <span className={`ts-dungeon-risk-badge is-${riskTone}`} title={riskTooltip}>
                                            {riskTier}
                                        </span>
                                    ) : null}
                                </div>
                                {completionCount > 0 ? (
                                    <span className="ts-dungeon-completion-badge">x{completionCount}</span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="ts-dungeon-card">
                <h3 className="ts-dungeon-card-title">2. Select 4 heroes</h3>
                {!canEnterDungeon ? (
                    <p className="ts-system-helper">Unlock requires 4 heroes in your roster.</p>
                ) : null}
                <div className="ts-dungeon-party-list">
                    {sortedPlayers.map((player) => {
                        const selected = selectedPartyPlayerIds.includes(player.id);
                        const combatSkillId = getCombatSkillIdForWeaponType(getEquippedWeaponType(player.equipment));
                        const combatLabel = combatLabelBySkillId[combatSkillId] ?? "Melee";
                        const combatLevel = player.skills[combatSkillId]?.level ?? 0;
                        const combatColor = getSkillIconColor(combatSkillId);
                        return (
                            <button
                                key={player.id}
                                type="button"
                                className={`ts-dungeon-party-option ts-focusable${selected ? " is-active" : ""}`}
                                onClick={() => onTogglePartyPlayer(player.id)}
                            >
                                <strong>{player.name}</strong>
                                <div className="ts-dungeon-party-combat">
                                    <span className="ts-dungeon-party-combat-icon" aria-hidden="true">
                                        <SkillIcon skillId={combatSkillId} color={combatColor} />
                                    </span>
                                    <span className="ts-dungeon-party-combat-label">{combatLabel}</span>
                                    <span className="ts-dungeon-party-combat-badge">{combatLevel}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="ts-dungeon-card">
                <h3 className="ts-dungeon-card-title">3. Preparation</h3>
                <div className="ts-dungeon-cost-row">
                    <span className="ts-dungeon-cost-label">Party power</span>
                    <span className={`ts-dungeon-cost-pill${hasPartySelection ? " is-ok" : ""}`}>
                        {hasPartySelection ? currentPower.toLocaleString() : "--"}
                    </span>
                </div>
                <div className="ts-dungeon-cost-row">
                    <span className="ts-dungeon-cost-label">Entry cost</span>
                    <span className="ts-dungeon-cost-pill">
                        Food: {safeRequiredFoodForStart.toLocaleString()}
                    </span>
                    <span className={`ts-dungeon-cost-pill ${hasEnoughFood ? "is-ok" : "is-low"}`}>
                        Available: {safeFoodCount.toLocaleString()}
                    </span>
                </div>
                {!hasEnoughFood ? (
                    <p className="ts-system-helper ts-dungeon-cost-warning">Not enough food to start this dungeon.</p>
                ) : null}
            </div>
        </div>
    );
};
