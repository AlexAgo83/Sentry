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
};

export const HeroNameModal = memo(({
    kicker,
    title,
    name,
    submitLabel,
    isSubmitDisabled,
    onNameChange,
    onSubmit,
    onClose
}: HeroNameModalProps) => (
    <ModalShell kicker={kicker} title={title} onClose={onClose}>
        <div className="ts-field-group">
            <label className="ts-field-label" htmlFor="hero-name-input">Hero name</label>
            <input
                id="hero-name-input"
                className="generic-field input ts-input ts-focusable"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                maxLength={20}
                placeholder="Up to 20 characters"
            />
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
