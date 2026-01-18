import { memo } from "react";
import type { OfflinePlayerSummary, OfflineSummaryState, SkillId } from "../../core/types";
import { ITEM_DEFINITIONS } from "../../data/definitions";
import { formatItemDeltaEntries, getItemDeltaEntries } from "../ui/itemFormatters";
import { ModalShell } from "./ModalShell";

type OfflineSummaryModalProps = {
    summary: OfflineSummaryState;
    offlineSeconds: number;
    players: OfflinePlayerSummary[];
    onClose: () => void;
    getSkillLabel: (skillId: SkillId | "") => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string | null) => string;
};

export const OfflineSummaryModal = memo(({
    summary,
    offlineSeconds,
    players,
    onClose,
    getSkillLabel,
    getRecipeLabel
}: OfflineSummaryModalProps) => {
    const summaryEntries = getItemDeltaEntries(ITEM_DEFINITIONS, summary.totalItemDeltas);
    const summaryLabel = summaryEntries.length > 0
        ? formatItemDeltaEntries(summaryEntries)
        : "None";

    return (
        <ModalShell kicker="Offline recap" title="Your party" onClose={onClose}>
            <ul className="ts-list">
                <li>Time away: {offlineSeconds}s</li>
                <li>Ticks processed: {summary.ticks}</li>
                <li>Players summarized: {players.length}</li>
                <li>Inventory changes: {summaryLabel}</li>
            </ul>
            <div className="ts-offline-players">
                {players.map((player) => {
                    const actionLabel = player.actionId
                        ? `Action ${getSkillLabel(player.actionId as SkillId)}${player.recipeId ? ` - Recipe ${getRecipeLabel(player.actionId as SkillId, player.recipeId)}` : ""}`
                        : "No action running";
                    const skillLevelLabel = player.skillLevelGained > 0
                        ? ` - +${player.skillLevelGained} Lv`
                        : "";
                    const recipeLevelLabel = player.recipeLevelGained > 0
                        ? ` - +${player.recipeLevelGained} Lv`
                        : "";
                    const itemEntries = getItemDeltaEntries(ITEM_DEFINITIONS, player.itemDeltas);
                    const itemLabel = itemEntries.length > 0
                        ? formatItemDeltaEntries(itemEntries)
                        : "None";

                    return (
                        <div key={player.playerId} className="ts-offline-player">
                            <div className="ts-offline-name">{player.playerName}</div>
                            <div className="ts-offline-meta">{actionLabel}</div>
                            <div className="ts-offline-gains">
                                Items: {itemLabel}
                            </div>
                            <div className="ts-offline-gains">
                                Skill +{player.skillXpGained} XP{skillLevelLabel} - Recipe +{player.recipeXpGained} XP{recipeLevelLabel}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ModalShell>
    );
});

OfflineSummaryModal.displayName = "OfflineSummaryModal";
