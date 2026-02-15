type TitleProps = {
    title: string;
};

type IconButtonProps = {
    title: string;
    "aria-label": string;
};

export const titleProps = (title: string): TitleProps => ({ title });

// Use for icon-only buttons: ensures both hover tooltip + accessible name.
export const iconButtonProps = (label: string): IconButtonProps => ({
    title: label,
    "aria-label": label
});

