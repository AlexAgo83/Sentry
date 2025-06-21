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
            this.listenersInit = false;
            return [
                this.createButton(
                    "add-player-btn", 
                    "Add New Player", 
                    () => {
                        let lastUsedId = -1;
                        this.instance.playerManager.getPlayers().forEach((player) => {
                            if (player.id > lastUsedId) {
                                lastUsedId = player.id;
                            }
                        })
                        const newId = lastUsedId + 1;
                        this.instance.playerManager.createPlayer(newId);
                    },
                    "red"
                ),
                this.createButton(
                    "start-btn", 
                    "Start Game Loop", 
                    () => {
                        this.instance.runAction();
                    },
                    "cyan"
                ),
                this.createButton(
                    "stop-btn", 
                    "Stop Game Loop", 
                    () => {
                        this.instance.stopAction();
                    },
                    "cyan"
                ),
                this.createButton(
                    "save-btn", 
                    "Save Game Data", 
                    () => {
                        this.instance.dataManager.save();
                    },
                    "yellow"
                ),
                this.createButton(
                    "load-btn", 
                    "Load Game Data", 
                    () => {
                        this.instance.resetInstance();
                        const savedData = this.instance.dataManager.load();
                        this.instance.initUI();
                        this.instance.runAction();
                        console.log("Game loaded", savedData);
                    },
                    "yellow"
                ),
                this.createButton(
                    "reset-btn", 
                    "Reset Game Data", 
                    () => {
                        this.instance.resetInstance();
                    },
                    "yellow"
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