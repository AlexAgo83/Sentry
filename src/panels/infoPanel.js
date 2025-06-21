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
            "info-panel-content"
        );

        this.setOnInit(() => {
            const result = [];
            const processTime = this.createLabelValue("processTime", "Process Time");
            result.push(processTime);
            console.log("setOnInit:Info panel setup", result);
            return result;
        })

        this.setOnRefresh(() => {
            const panel = this.getPanel();
            if (panel) {
                const contentPanel = this.getContentPanel();
                if (contentPanel) {
                    const processTime = contentPanel.querySelector(`#processTime`);
                    if (processTime) processTime.textContent = String(this.instance.lastIntervalTime);
                } else {
                    console.log("onRefresh:Info panel not setup");
                }
            } else {
                console.log("onRefresh:Info panel not found");
            }
        })
    }
}