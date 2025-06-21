// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// corePanel.js

export class CorePanel {
    
    constructor(instance, panelId, contentId, columnMode=false) {
        this.instance = instance;
        this.panelId = panelId;
        this.contentId = contentId;
        this.columnMode = columnMode;
    }

    getInstance = () => {
        return this.instance;
    }

    onInit = () => {
        // Default onInit ...
        console.log("onInit:Default onInit ...");
        return []
    }
    
    setOnInit = (func) => {
        this.onInit = func;
    }

    init = () => {
        /** INFO PANEL */
        const panel = this.getPanel();
        const contentPanel = this.getContentPanel();
        if (contentPanel) console.log(`init:Panel ${this.panelId} already setup`);
        else {
            const newContent = document.createElement("div");
            newContent.id = this.contentId;
            newContent.style.margin = "10px";
            newContent.style.display = "flex";
            if (this.columnMode) {
                newContent.style.flexDirection = "column";
            } else newContent.style.flexDirection = "row";
            newContent.append(...this.onInit());
            panel?.appendChild(newContent);
            console.log(`init:Panel ${this.panelId} setup`);
        }
    }

    createLabelValue = (id, label, defaultValue=null) => {
        const newPanel = document.createElement("p");
        newPanel.style.margin = "2px";
        newPanel.style.padding = "0px";
        const newSpanLabel = document.createElement("span");
        newSpanLabel.textContent = label + " : ";
        newPanel.appendChild(newSpanLabel);
        const newSpanValue = document.createElement("span");
        newSpanValue.id = id;
        newSpanValue.textContent = defaultValue ? defaultValue : "N/A";
        newPanel.appendChild(newSpanValue);
        return newPanel;
    }

    createButton = (id, label, onClick, color) => {
        const newButton = document.createElement("button");
        newButton.id = id;
        if (color) newButton.style.backgroundColor = color;
        newButton.textContent = label;
        if (onClick) newButton.addEventListener("click", onClick);
        return newButton;
    }

    remove = () => {
        const contentPanel = this.getContentPanel();
        if (contentPanel) {
            contentPanel.remove();
            console.log(`remove:Panel ${this.contentId} removed`);
        } else {
            console.log(`remove:Panel ${this.contentId} not found`);
        }
    }

    setOnRefresh = (func) => {
        this.onRefresh = func;
        console.log("setOnRefresh:onRefresh set", func);
    }

    onRefresh = () => {
        // Default onRefresh ...
        console.log("onRefresh:Default onRefresh ...");
    }

    refresh = () => {
        if (!this.getPanel()) {
            console.log("refresh:Panel not found for " + this.panelId);
            return;
        }
        this.onRefresh();
    }

    getPanel = () => {
        return document.body.querySelector("#" + this.panelId);
    }

    getContentPanel = () => {
        return this.getPanel()?.querySelector("#" + this.contentId);
    }

    getElement(id) {
        return this.getContentPanel()?.querySelector("#" + id);
    }
}