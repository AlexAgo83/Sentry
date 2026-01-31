import { memo, type FormEvent } from "react";
import { ModalShell } from "./ModalShell";

type OnboardingHeroModalProps = {
    name: string;
    isSubmitDisabled: boolean;
    onNameChange: (value: string) => void;
    onSubmit: () => void;
};

export const OnboardingHeroModal = memo(({
    name,
    isSubmitDisabled,
    onNameChange,
    onSubmit,
}: OnboardingHeroModalProps) => {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitDisabled) {
            return;
        }
        onSubmit();
    };

    return (
        <ModalShell
            kicker="First time setup"
            title="Create your hero"
            onClose={() => {}}
            showClose={false}
            onBackdropClick={() => {}}
            onEscape={() => {}}
        >
            <form className="ts-field-group" onSubmit={handleSubmit}>
                <p className="ts-system-helper">Pick a name to begin your journey.</p>
                <label className="ts-field-label" htmlFor="onboarding-hero-name">Hero name</label>
                <input
                    id="onboarding-hero-name"
                    className="generic-field input ts-input ts-focusable"
                    data-testid="onboarding-hero-name"
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                    maxLength={20}
                    placeholder="Up to 20 characters"
                    autoFocus
                />
                <div className="ts-action-row">
                    <button
                        type="submit"
                        className="generic-field button ts-focusable"
                        disabled={isSubmitDisabled}
                        data-testid="onboarding-create-hero"
                    >
                        Create hero
                    </button>
                </div>
            </form>
        </ModalShell>
    );
});

OnboardingHeroModal.displayName = "OnboardingHeroModal";
