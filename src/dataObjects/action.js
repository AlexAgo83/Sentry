// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// action.js

export class Action {

    constructor(identifier, player) {
        this.identifier = identifier;
        this.player = player;
    }

    getIdentifier = () => {
        return this.identifier;
    }

    getPlayer = () => {
        return this.player;
    }

    setOnDoAction(onDoAction) {
        this.onDoAction = onDoAction;
    }

    onDoAction = () => {
        // Default onDoAction ...
        console.log("onDoAction:Default onDoAction ...");
    }

    doAction = (player) => {
        this.onDoAction();
    };
}