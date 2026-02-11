import { memo } from "react";
import { ModalShell } from "./ModalShell";
import type { CrashReport } from "../../observability/crashReporter";

type CrashReportsModalProps = {
    crashReports: CrashReport[];
    onClearCrashReports: () => void;
    onClose: () => void;
    closeLabel?: string;
};

export const CrashReportsModal = memo(({
    crashReports,
    onClearCrashReports,
    onClose,
    closeLabel
}: CrashReportsModalProps) => (
    <ModalShell kicker="System" title="Crash reports" onClose={onClose} closeLabel={closeLabel}>
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
                        onClick={onClearCrashReports}
                    >
                        Clear crash reports
                    </button>
                </div>
            </>
        ) : (
            <span className="ts-system-helper">No crash reports recorded.</span>
        )}
    </ModalShell>
));

CrashReportsModal.displayName = "CrashReportsModal";
