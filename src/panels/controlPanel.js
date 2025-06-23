// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// controlsPanel.js

import { CorePanel } from "./corePanel.js";

export class ControlPanel extends CorePanel {

    constructor(instance) {
        super(
            instance, 
            "controls-panel", 
            "controls-panel-content");

        this.setOnInit(() => {
            const result = [];

            const newCtrlBtnDiv = document.createElement("div");
            newCtrlBtnDiv.id = this.genId("admin-buttons");

            this.registerComponent(
                newCtrlBtnDiv,
                this.createButton(
                    "add-player-btn", 
                    "Add New Player", 
                    () => {
                        let lastUsedId = -1;
                        this.instance.playerManager.getPlayers().forEach((player) => {
                            if (player.getIdentifier() > lastUsedId) {
                                lastUsedId = player.getIdentifier();
                            }
                        })
                        const newId = lastUsedId + 1;
                        this.instance.playerManager.createPlayer(newId);
                    },
                    "red"
                )
            );
                
            this.registerComponent(
                newCtrlBtnDiv,
                this.createButton(
                    "start-btn", 
                    "Start Game Loop", 
                    () => {
                        this.instance.runAction();
                    },
                    "cyan"
                )
            );

            this.registerComponent(
                newCtrlBtnDiv,
                this.createButton(
                    "stop-btn", 
                    "Stop Game Loop",
                    () => {
                        this.instance.stopLoop();
                    },
                    "cyan"
                )
            );
              
            result.push(newCtrlBtnDiv);
            return result;
        });

        this.setOnRefresh(() => {
            // const panel = this.getPanel();
            // if (panel) {
             
            // }
        });
    }
}