// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// controlsPanel.js

import { CorePanel } from "./corePanel.js";

export class ControlsPanel extends CorePanel {

    constructor(instance) {
        super(
            instance, 
            "controls-panel", 
            "controls-panel-content");

        this.setOnInit(() => {
            this.listenersInit = false;
            return [
                this.createButton(
                    "save-btn", 
                    "Save", 
                    () => {
                        this.instance.saveGame();
                    }
                ),
                this.createButton(
                    "load-btn", 
                    "Load", 
                    () => {
                        this.instance.loadSavedGameWithRestart();
                    }
                ),
                this.createButton(
                    "reset-btn", 
                    "Reset", 
                    () => {
                        this.instance.resetInstance();
                    }
                )
            ]
        });

        this.setOnRefresh(() => {
            // const panel = this.getPanel();
            // if (panel) {
             
            // }
        });
    }
}