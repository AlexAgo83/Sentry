// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersListPanel.js

import { CorePanel } from "./corePanel.js";
import { PlayerCardPanel } from "./playerCardPanel.js";

export class PlayerListPanel extends CorePanel {
    constructor(instance) {
        super(
            instance,
            "player-list-panel", 
            "player-list-panel-content",
            false
        );
        this.maxRecipe = 10;

        this.setOnPrepare(() => {
            const playersObject = this.instance.playerManager.getPlayers();
            playersObject.forEach((player) => {
                /** SETUP Player Card Panels */
                let isAlreadyAdded = false;
                this.subPanels.forEach((subPanel) => {
                    if (subPanel instanceof PlayerCardPanel
                        && subPanel.player.id == player.id) {
                        isAlreadyAdded = true;
                    }
                });
                /** If not already added */
                if (!isAlreadyAdded) {
                    const playerCardPanel = new PlayerCardPanel(this.instance, this.contentId, "player-card-" + player.id, player);
                    this.registerSubPanel(playerCardPanel);
                    // console.log(`SubModule: player-card-${player.id}-panel registered !`);
                }
            });
        })

        /** ON INIT */
        this.setOnInit(() => {
            const result = [];
            // const playersObject = this.instance.playerManager.getPlayers();
            // playersObject.forEach((player) => {
            //     // ...
            // })
            return result;
        })

        /** ON REFRESH */
        this.setOnRefresh(() => {
            // const panel = this.getPanel();
            // if (panel) {
            //     const contentPanel = this.getContentPanel();
            //     if (contentPanel) {
            //         // ...
            //     }
            // }
        });
    }
}