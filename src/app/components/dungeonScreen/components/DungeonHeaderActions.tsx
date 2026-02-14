import type { DungeonReplayState, DungeonRunState } from "../../../../core/types";
import { BackIcon } from "../../../ui/backIcon";
import { ChangeIcon } from "../../../ui/changeIcon";
import { AutoHealOffIcon, AutoHealOnIcon, AutoRestartOffIcon, AutoRestartOnIcon } from "../../../ui/dungeonIcons";
import { InterruptIcon } from "../../../ui/interruptIcon";
import { StartActionIcon } from "../../../ui/startActionIcon";
import { TabIcon } from "../../../ui/tabIcons";
import { formatCompactCount } from "../utils";

type DungeonHeaderActionsProps = {
    activeRun: DungeonRunState | null;
    isReplayScreen: boolean;
    canStartRun: boolean;
    latestReplay: DungeonReplayState | null;
    replayPaused: boolean;
    replayView: "group" | "log";
    autoConsumables: boolean;
    canUseConsumables: boolean;
    consumablesCount: number;
    onStartRun: () => void;
    onToggleReplay: () => void;
    onReplayPlayPause: () => void;
    onReplayViewToggle: () => void;
    onToggleAutoRestart: (value: boolean) => void;
    onToggleAutoConsumables: (value: boolean) => void;
    onStopRun: () => void;
};

export const DungeonHeaderActions = ({
    activeRun,
    isReplayScreen,
    canStartRun,
    latestReplay,
    replayPaused,
    replayView,
    autoConsumables,
    canUseConsumables,
    consumablesCount,
    onStartRun,
    onToggleReplay,
    onReplayPlayPause,
    onReplayViewToggle,
    onToggleAutoRestart,
    onToggleAutoConsumables,
    onStopRun
}: DungeonHeaderActionsProps) => {
    const startRunButtonClassName = [
        "ts-collapse-button",
        "ts-focusable",
        "ts-action-start",
        "ts-action-button",
        !activeRun && canStartRun ? "is-ready-new" : ""
    ].filter(Boolean).join(" ");
    const replayButtonClassName = [
        "ts-collapse-button",
        "ts-focusable",
        "ts-action-change",
        "ts-action-button",
        !activeRun && latestReplay ? "is-ready-active" : ""
    ].filter(Boolean).join(" ");
    const stopRunButtonClassName = [
        "ts-collapse-button",
        "ts-focusable",
        "ts-action-stop",
        "ts-action-button",
        activeRun ? "is-ready-stop" : ""
    ].filter(Boolean).join(" ");
    const autoConsumablesButtonClassName = [
        "ts-icon-button",
        "ts-focusable",
        "ts-dungeon-auto-restart-button",
        "ts-dungeon-auto-consume-button",
        !canUseConsumables ? "is-unavailable" : "",
        autoConsumables ? " is-active" : ""
    ].filter(Boolean).join(" ");

    return (
        <div className="ts-panel-actions ts-panel-actions-inline">
            {!activeRun && !isReplayScreen ? (
                <>
                    <button
                        type="button"
                        className={startRunButtonClassName}
                        onClick={onStartRun}
                        disabled={!canStartRun}
                        aria-label="Start run"
                        title="Start run"
                        data-testid="dungeon-start-run"
                    >
                        <span className="ts-collapse-label"><StartActionIcon /></span>
                        <span className="ts-action-button-label">Start</span>
                    </button>
                    <button
                        type="button"
                        className={replayButtonClassName}
                        onClick={onToggleReplay}
                        disabled={!latestReplay}
                        aria-label="Show replay"
                        title="Show replay"
                    >
                        <span className="ts-collapse-label"><ChangeIcon /></span>
                        <span className="ts-action-button-label">Replay</span>
                    </button>
                </>
            ) : null}
            {isReplayScreen ? (
                <>
                    <button
                        type="button"
                        className={`ts-icon-button ts-panel-action-button ts-focusable ts-dungeon-replay-button ts-dungeon-replay-toggle${!replayPaused ? " is-active" : ""}`}
                        onClick={onReplayPlayPause}
                    >
                        <span className="ts-panel-action-icon" aria-hidden="true">
                            {replayPaused ? <StartActionIcon /> : <InterruptIcon />}
                        </span>
                        <span className="ts-panel-action-label">{replayPaused ? "Play" : "Pause"}</span>
                    </button>
                    <button
                        type="button"
                        className="ts-icon-button ts-panel-action-button ts-focusable ts-dungeon-replay-button"
                        onClick={onReplayViewToggle}
                        aria-pressed={replayView === "log"}
                        aria-label={replayView === "group" ? "Switch to log view" : "Switch to party view"}
                        title={replayView === "group" ? "Switch to log view" : "Switch to party view"}
                    >
                        <span className="ts-panel-action-icon" aria-hidden="true">
                            {replayView === "group" ? <TabIcon kind="stats" /> : <TabIcon kind="hero" />}
                        </span>
                        <span className="ts-panel-action-label">
                            {replayView === "group" ? "Log" : "Party"}
                        </span>
                    </button>
                    <button
                        type="button"
                        className="ts-collapse-button ts-focusable ts-action-button"
                        onClick={onToggleReplay}
                        aria-label="Back to dungeon"
                        title="Back to dungeon"
                    >
                        <span className="ts-collapse-label"><BackIcon /></span>
                        <span className="ts-action-button-label">Back</span>
                    </button>
                </>
            ) : null}
            {activeRun ? (
                <button
                    type="button"
                    className={`ts-icon-button ts-focusable ts-dungeon-auto-restart-button${activeRun.autoRestart ? " is-active" : ""}`}
                    onClick={() => onToggleAutoRestart(!activeRun.autoRestart)}
                    aria-pressed={activeRun.autoRestart}
                    aria-label={activeRun.autoRestart ? "Disable auto restart" : "Enable auto restart"}
                    title={activeRun.autoRestart ? "Disable auto restart" : "Enable auto restart"}
                >
                    <span className="ts-dungeon-action-label ts-action-button-label">Auto restart</span>
                    <span className="ts-dungeon-action-icon">
                        {activeRun.autoRestart ? <AutoRestartOnIcon /> : <AutoRestartOffIcon />}
                    </span>
                </button>
            ) : null}
            {activeRun ? (
                <button
                    type="button"
                    className={autoConsumablesButtonClassName}
                    onClick={() => onToggleAutoConsumables(!autoConsumables)}
                    aria-pressed={autoConsumables}
                    aria-label={autoConsumables ? "Disable auto heal" : "Enable auto heal"}
                    title={canUseConsumables
                        ? "Auto-use healing consumables during fights"
                        : "Requires at least 1 consumable (potion, tonic, elixir)."}
                    disabled={!canUseConsumables}
                >
                    <span className="ts-dungeon-action-label ts-action-button-label">Auto heal</span>
                    {consumablesCount > 0 ? (
                        <span className="ts-dungeon-consumable-count">{formatCompactCount(consumablesCount)}</span>
                    ) : null}
                    <span className={`ts-dungeon-heal-icon${autoConsumables ? " is-active" : " is-off"}`}>
                        {autoConsumables ? <AutoHealOnIcon /> : <AutoHealOffIcon />}
                    </span>
                </button>
            ) : null}
            {activeRun ? (
                <button
                    type="button"
                    className={stopRunButtonClassName}
                    onClick={onStopRun}
                    aria-label="Stop run"
                    title="Stop run"
                >
                    <span className="ts-collapse-label"><InterruptIcon /></span>
                    <span className="ts-action-button-label">Stop</span>
                </button>
            ) : null}
        </div>
    );
};
