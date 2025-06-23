// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// toolsPanel.js

const REF_TOOLS_PANEL = "tools-panel";
const REF_TOOLS_PANEL_CONTENT = "tools-panel-content";

const REF_TOOLS_ADMIN_BTN = "admin-buttons";
const REF_TOOLS_ADD_PLAYER_BTN = "add-player-btn";
const REF_TOOLS_START_LOOP_BTN = "start-loop-btn";
const REF_TOOLS_STOP_LOOP_BTN = "stop-loop-btn";

import { CorePanel } from "./corePanel.js";

export class ToolsPanel extends CorePanel {

    constructor(instance) {
        super(
            instance, 
            REF_TOOLS_PANEL, 
            REF_TOOLS_PANEL_CONTENT
        );

        this.setOnInit(() => {
            const result = [];

            const newCtrlBtnDiv = document.createElement("div");
            newCtrlBtnDiv.id = this.genId(REF_TOOLS_ADMIN_BTN);

            const btAddPlayer = this.createButton(
                REF_TOOLS_ADD_PLAYER_BTN, 
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
                }
            );
            this.registerComponent(
                newCtrlBtnDiv,
                btAddPlayer
            );
                
            // this.registerComponent(
            //     newCtrlBtnDiv,
            //     this.createButton(
            //         REF_TOOLS_START_LOOP_BTN, 
            //         "Start Game Loop", 
            //         () => {
            //             this.instance.runAction();
            //         }
            //     )
            // );

            // this.registerComponent(
            //     newCtrlBtnDiv,
            //     this.createButton(
            //         REF_TOOLS_STOP_LOOP_BTN, 
            //         "Stop Game Loop",
            //         () => {
            //             this.instance.stopLoop();
            //         }
            //     )
            // );
              
            result.push(newCtrlBtnDiv);
            return result;
        });

        this.setOnPostInit(() => {
            this.getContentPanel()?.classList.add("tools-panel-content");
        });

        this.setOnRefresh(() => {
            // const panel = this.getPanel();
            // if (panel) {
             
            // }
        });
    }
}