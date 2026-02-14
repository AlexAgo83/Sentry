import { memo, useEffect, useState } from "react";
import { ModalShell } from "./ModalShell";
import type { CrashReport } from "../../observability/crashReporter";

type CrashReportsModalProps = {
    crashReports: CrashReport[];
    onClearCrashReports: () => void;
    onClose: () => void;
    closeLabel?: string;
};

const toCrashLogsText = (reports: CrashReport[]): string => {
    return reports.map((report, index) => {
        const lines = [
            `#${index + 1} [${report.kind}] ${new Date(report.timestamp).toISOString()}`,
            `message: ${report.message}`
        ];
        if (report.url) {
            lines.push(`url: ${report.url}`);
        }
        if (report.appVersion) {
            lines.push(`appVersion: ${report.appVersion}`);
        }
        if (report.stack) {
            lines.push("stack:");
            lines.push(report.stack);
        }
        return lines.join("\n");
    }).join("\n\n---\n\n");
};

const copyCrashLogs = async (raw: string): Promise<"clipboard" | "prompt" | "failed"> => {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(raw);
            return "clipboard";
        } catch {
            // Fall through to prompt fallback.
        }
    }
    if (typeof window !== "undefined" && typeof window.prompt === "function") {
        const result = window.prompt("Copy crash logs:", raw);
        return result === null ? "failed" : "prompt";
    }
    return "failed";
};

export const CrashReportsModal = memo(({
    crashReports,
    onClearCrashReports,
    onClose,
    closeLabel
}: CrashReportsModalProps) => {
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

    useEffect(() => {
        if (!copyFeedback) {
            return;
        }
        const timeout = setTimeout(() => setCopyFeedback(null), 2400);
        return () => clearTimeout(timeout);
    }, [copyFeedback]);

    return (
        <ModalShell kicker="System" title="Reports" onClose={onClose} closeLabel={closeLabel}>
            {crashReports.length > 0 ? (
                <>
                    <ul className="ts-list ts-crash-list">
                        {crashReports.map((report) => (
                            <li key={report.id}>
                                [{report.kind}] {report.message}
                            </li>
                        ))}
                    </ul>
                    <div className="ts-action-row ts-system-actions ts-crash-actions">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={() => {
                                const logs = toCrashLogsText(crashReports);
                                void copyCrashLogs(logs).then((result) => {
                                    if (result === "clipboard") {
                                        setCopyFeedback("Crash logs copied to clipboard.");
                                        return;
                                    }
                                    if (result === "prompt") {
                                        setCopyFeedback("Crash logs ready to copy.");
                                    }
                                });
                            }}
                        >
                            Copy crash logs
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={onClearCrashReports}
                        >
                            Clear crash reports
                        </button>
                    </div>
                    {copyFeedback ? (
                        <span className="ts-system-helper ts-system-helper-success" data-testid="crash-copy-feedback">
                            {copyFeedback}
                        </span>
                    ) : null}
                </>
            ) : (
                <span className="ts-system-helper">No crash reports recorded.</span>
            )}
        </ModalShell>
    );
});

CrashReportsModal.displayName = "CrashReportsModal";
