import type { ReactNode } from "react";
import { Component } from "react";
import { recordCrashReport } from "../../observability/crashReporter";

type ErrorBoundaryProps = {
    children: ReactNode;
    appVersion?: string;
};

type ErrorBoundaryState = {
    hasError: boolean;
    message: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, message: "" };

    static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
        const message = error && typeof error === "object" && "message" in error
            ? String((error as { message?: unknown }).message ?? "Unknown error")
            : "Unknown error";
        return { hasError: true, message };
    }

    componentDidCatch(error: unknown) {
        recordCrashReport({
            kind: "react",
            message: this.state.message || "React error",
            stack: error && typeof error === "object" && "stack" in error
                ? String((error as { stack?: unknown }).stack ?? "")
                : undefined,
            appVersion: this.props.appVersion
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="ts-app">
                <main className="ts-main">
                    <section className="generic-panel ts-panel">
                        <div className="ts-panel-header">
                            <h2 className="ts-panel-title">Something went wrong</h2>
                        </div>
                        <div className="ts-panel-body">
                            <p className="ts-muted">{this.state.message}</p>
                            <div className="ts-action-row">
                                <button
                                    type="button"
                                    className="generic-field button ts-focusable"
                                    onClick={this.handleReload}
                                >
                                    Reload
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        );
    }
}

