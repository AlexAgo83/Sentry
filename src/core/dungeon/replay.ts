import type { DungeonReplayEvent, DungeonReplayState, DungeonRunState, PlayerId, PlayerState } from "../types";
import { DUNGEON_REPLAY_MAX_BYTES, DUNGEON_REPLAY_MAX_EVENTS, DUNGEON_TOTAL_EVENT_CAP } from "./constants";

export const getReplayCriticalEvents = (events: DungeonReplayEvent[]) => {
    return events.filter((event) => {
        return event.type === "floor_start"
            || event.type === "boss_start"
            || event.type === "heal"
            || event.type === "death"
            || event.type === "run_end";
    });
};

export const isCriticalEventType = (type: DungeonReplayEvent["type"]) => {
    return type === "floor_start"
        || type === "boss_start"
        || type === "heal"
        || type === "death"
        || type === "run_end";
};

export const countNonCriticalEvents = (events: DungeonReplayEvent[]) => {
    return events.reduce((total, event) => total + (isCriticalEventType(event.type) ? 0 : 1), 0);
};

const encodeSize = (value: unknown): number => {
    try {
        return new TextEncoder().encode(JSON.stringify(value)).length;
    } catch {
        return Number.POSITIVE_INFINITY;
    }
};

export const buildReplay = (
    run: DungeonRunState,
    players: Record<PlayerId, PlayerState>,
    inventoryAtStart: DungeonReplayState["startInventory"]
): DungeonReplayState => {
    let events = run.events.slice(0, DUNGEON_REPLAY_MAX_EVENTS);
    let truncated = run.events.length > events.length || run.truncatedEvents > 0;
    let fallbackCriticalOnly = false;
    const bytes = encodeSize(events);
    if (bytes > DUNGEON_REPLAY_MAX_BYTES) {
        events = getReplayCriticalEvents(events);
        fallbackCriticalOnly = true;
        truncated = true;
    }

    const teamSnapshot = run.party.map((member) => {
        const player = players[member.playerId];
        return {
            playerId: member.playerId,
            name: player?.name ?? `Hero ${member.playerId}`,
            equipment: player?.equipment ?? {
                slots: {
                    Head: null,
                    Cape: null,
                    Torso: null,
                    Legs: null,
                    Hands: null,
                    Feet: null,
                    Ring: null,
                    Amulet: null,
                    Weapon: null,
                    Tablet: null
                },
                charges: {
                    Head: null,
                    Cape: null,
                    Torso: null,
                    Legs: null,
                    Hands: null,
                    Feet: null,
                    Ring: null,
                    Amulet: null,
                    Weapon: null,
                    Tablet: null
                }
            }
        };
    });

    const fallbackThreat = run.party.reduce<Record<PlayerId, number>>((acc, member) => {
        acc[member.playerId] = 0;
        return acc;
    }, {} as Record<PlayerId, number>);

    return {
        runId: run.id,
        dungeonId: run.dungeonId,
        status: run.endReason === "victory" ? "victory" : "failed",
        endReason: run.endReason ?? "stopped",
        runIndex: run.runIndex,
        startedAt: run.startedAt,
        elapsedMs: run.elapsedMs,
        seed: run.seed,
        partyPlayerIds: run.party.map((member) => member.playerId),
        teamSnapshot,
        startInventory: inventoryAtStart,
        events,
        truncated,
        fallbackCriticalOnly,
        cadenceSnapshot: run.cadenceSnapshot,
        threatByHeroId: run.threatByHeroId ?? fallbackThreat
    };
};

const pushEvent = (run: DungeonRunState, event: Omit<DungeonReplayEvent, "atMs">) => {
    run.events.push({
        atMs: run.elapsedMs,
        ...event
    });
};

export const pushEventWithGlobalCap = (run: DungeonRunState, event: Omit<DungeonReplayEvent, "atMs">) => {
    const isCritical = isCriticalEventType(event.type);
    if (!isCritical && run.nonCriticalEventCount >= DUNGEON_TOTAL_EVENT_CAP) {
        run.truncatedEvents += 1;
        return false;
    }
    pushEvent(run, event);
    if (!isCritical) {
        run.nonCriticalEventCount += 1;
    }
    return true;
};

export const createStepEventPusher = (
    run: DungeonRunState,
    stepEventCap: number,
    onStepTruncate: () => void
) => {
    let stepEventCount = 0;
    return {
        push: (event: Omit<DungeonReplayEvent, "atMs">) => {
            const isCritical = isCriticalEventType(event.type);
            if (!isCritical && stepEventCount >= stepEventCap) {
                onStepTruncate();
                return false;
            }
            if (!pushEventWithGlobalCap(run, event)) {
                return false;
            }
            if (!isCritical) {
                stepEventCount += 1;
            }
            return true;
        }
    };
};
