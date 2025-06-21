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
            const processTime = this.createLabelValue("Process Time", "processTime");
            result.push(processTime);
            console.log("setOnInit:Info panel setup", result);
            return result;
        })

        this.setOnRefresh(() => {
            const panel = this.getPanel();
            if (panel) {
                const processTime = panel.querySelector(`#processTime`);
                if (processTime) processTime.textContent = String(this.instance.processTime);
            }
        })
    }
}