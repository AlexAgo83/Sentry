// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// panelManager.js

import { CoreManager } from "./coreManager.js";
import { InfoPanel } from "../panels/infoPanel.js";
import { PlayerListPanel } from "../panels/playerListPanel.js";
import { ToolsPanel } from "../panels/toolsPanel.js";

export class PanelManager extends CoreManager {

    constructor(instance) {
        super(instance);

        this.infoPanel = new InfoPanel(instance);
        this.playersPanel = new PlayerListPanel(instance);
        this.controlsPanel = new ToolsPanel(instance);
    }

    init = () => {
        this.infoPanel.init();
        this.playersPanel.init();
        this.controlsPanel.init();
        // console.log("init:Panels setup");
    }

    remove = () => {
        this.infoPanel.remove();
        this.playersPanel.remove();
        this.controlsPanel.remove();
        // console.log("remove:Panels removed");
    }

    refresh = () => {
        this.infoPanel?.refresh();
        this.playersPanel?.refresh();
        this.controlsPanel?.refresh();
    }
}