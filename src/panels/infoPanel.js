// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// infoPanel.js

import { CorePanel } from "./corePanel.js";

export class InfoPanel extends CorePanel {
    constructor(instance) {
        super(
            instance,
            "info-panel", 
            "info-panel-content",
            true
        );

        this.setOnInit(() => {
            const result = [];
            result.push(this.createLabelValue("processTime", "Process Time"));
            result.push(this.createLabelValue("gameVersion", "Game Version"));
            return result;
        })

        this.setOnRefresh(() => {
            const panel = this.getPanel();
            if (panel) {
                const contentPanel = this.getContentPanel();
                if (contentPanel) {
                    /** Process Time */
                    const processTime = contentPanel.querySelector(`#processTime`);
                    if (processTime) processTime.textContent = String(this.instance.lastIntervalTime);
                    /** Game Version */
                    const gameVersion = contentPanel.querySelector(`#gameVersion`);
                    if (gameVersion) gameVersion.textContent = String(this.instance.getGameVersion());
                } else {
                    console.log("onRefresh:Info panel not setup");
                }
            } else {
                console.log("onRefresh:Info panel not found");
            }
        })
    }
}