// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playerControlsPanel.js

import { CorePanel } from "./corePanel.js";

export class PlayerControlsPanel extends CorePanel {
    constructor(instance, parentId, contentId, player) {
        super(
            instance,
            parentId, 
            contentId,
            false
        );

        this.player = player;

        this.setOnGenId(() => {
            return player.getIdentifier();
        })

        this.setOnInit(() => {
            // ...
        });

        this.setOnRefresh(() => {
            // ...
        })
    }
}