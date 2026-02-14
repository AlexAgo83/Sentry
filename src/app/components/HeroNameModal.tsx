import { memo } from "react";
import { ModalShell } from "./ModalShell";

type HeroNameModalProps = {
    kicker: string;
    title: string;
    name: string;
    submitLabel: string;
    isSubmitDisabled: boolean;
    onNameChange: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
    fieldLabel?: string;
    inputId?: string;
    maxLength?: number;
    placeholder?: string;
    helperText?: string | null;
};

export const HeroNameModal = memo(({
    kicker,
    title,
    name,
    submitLabel,
    isSubmitDisabled,
    onNameChange,
    onSubmit,
    onClose,
    fieldLabel = "Hero name",
    inputId = "hero-name-input",
    maxLength = 20,
    placeholder = "Up to 20 characters",
    helperText = null
}: HeroNameModalProps) => (
    <ModalShell kicker={kicker} title={title} onClose={onClose}>
        <div className="ts-field-group">
            <label className="ts-field-label" htmlFor={inputId}>{fieldLabel}</label>
            <input
                id={inputId}
                className="generic-field input ts-input ts-focusable"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                maxLength={maxLength}
                placeholder={placeholder}
            />
            {helperText ? (
                <p className="ts-system-helper ts-system-cloud-error" data-testid="hero-name-helper">{helperText}</p>
            ) : null}
            <div className="ts-action-row">
                <button
                    type="button"
                    className="generic-field button ts-focusable"
                    onClick={onSubmit}
                    disabled={isSubmitDisabled}
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    </ModalShell>
));

HeroNameModal.displayName = "HeroNameModal";
