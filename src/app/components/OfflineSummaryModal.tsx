import { memo } from "react";
import type { OfflinePlayerSummary, OfflineSummaryState, SkillId } from "../../core/types";
import { ITEM_DEFINITIONS } from "../../data/definitions";
import { formatItemDeltaEntries, getItemDeltaEntries } from "../ui/itemFormatters";
import { ModalShell } from "./ModalShell";

type OfflineSummaryModalProps = {
    summary: OfflineSummaryState;
    players: OfflinePlayerSummary[];
    onClose: () => void;
    getSkillLabel: (skillId: SkillId | "") => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string | null) => string;
};

export const OfflineSummaryModal = memo(({
    summary,
    players,
    onClose,
    getSkillLabel,
    getRecipeLabel
}: OfflineSummaryModalProps) => {
    const formatTimeAway = (seconds: number): string => {
        const safeSeconds = Math.max(0, Math.floor(seconds));
        if (safeSeconds < 60) {
            return `${safeSeconds}s`;
        }
        if (safeSeconds < 3600) {
            const minutes = Math.floor(safeSeconds / 60);
            const remainderSeconds = safeSeconds % 60;
            return `${minutes}m ${remainderSeconds}s`;
        }
        const hours = Math.floor(safeSeconds / 3600);
        const minutes = Math.floor((safeSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };
    const formatXp = (value: number): string => {
        if (!Number.isFinite(value)) {
            return "0";
        }
        return String(Math.round(value));
    };
    const summaryEntries = getItemDeltaEntries(ITEM_DEFINITIONS, summary.totalItemDeltas);
    const summaryLabel = summaryEntries.length > 0
        ? formatItemDeltaEntries(summaryEntries)
        : "None";

    const awaySeconds = Math.round(summary.durationMs / 1000);
    const processedSeconds = Math.round(summary.processedMs / 1000);
    const showProcessed = summary.capped || processedSeconds !== awaySeconds;

    return (
        <ModalShell kicker="Offline recap" title="Your party" onClose={onClose}>
            <ul className="ts-list">
                <li>Time away: {formatTimeAway(awaySeconds)}</li>
                {showProcessed ? (
                    <li>
                        Processed: {formatTimeAway(processedSeconds)}
                        {summary.capped ? " (capped)" : ""}
                    </li>
                ) : null}
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
                                Skill +{formatXp(player.skillXpGained)} XP{skillLevelLabel} - Recipe +{formatXp(player.recipeXpGained)} XP{recipeLevelLabel}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ModalShell>
    );
});

OfflineSummaryModal.displayName = "OfflineSummaryModal";
