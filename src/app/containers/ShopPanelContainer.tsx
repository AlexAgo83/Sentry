import { ShopPanel } from "../components/ShopPanel";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";

export const ShopPanelContainer = () => {
    const [isCollapsed, setCollapsed] = usePersistedCollapse("shop", false);

    return (
        <ShopPanel
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
        />
    );
};
