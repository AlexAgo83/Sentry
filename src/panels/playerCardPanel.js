// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersListPanel.js

import { CorePanel } from "./corePanel.js";

export class PlayerCardPanel extends CorePanel {
    constructor(instance) {
        super(
            instance,
            "player-list-panel", 
            "player-list-panel-content",
            false
        );

        this.setOnInit(() => {
            const result = [];
            // newPlayerDiv.appendChild(this.createLabelValue("id", "ID"));
            return result;
        });
    
        this.setOnRefresh(() => {
            const panel = this.getPanel();
            if (panel) {
                const contentPanel = this.getContentPanel();
                if (contentPanel) {
                    // ...
                }
            }
        })
    }
}