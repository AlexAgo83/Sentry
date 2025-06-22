// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// windowPanel.js

import { CorePanel } from "./corePanel.js";

export class WindowPanel extends CorePanel {
    constructor(instance) {
        super(
            instance,
            "window-panel", 
            "window-panel-content",
            false
        );
        this.setOnInit(() => {
            const result = [];
            // ...result.push(this.createLabelValue("???"));
            return result;
        })
        this.setOnRefresh(() => {
            const panel = this.getPanel();
            if (panel) {
                const contentPanel = this.getContentPanel();
                if (contentPanel) {
                    // ...contentPanel.querySelector(`#???`);
                }
            }
        })
    }
}