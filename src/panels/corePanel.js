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

    /**
     * Initializes the panel
     */
    init = () => {
        /** INFO PANEL */
        const panel = this.getPanel();
        const contentPanel = this.getContentPanel();
        if (contentPanel) {
            // console.log(`init:Panel ${this.panelId} already setup, skip!`);
        } else {
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

    /**
     * Creates a label
     * 
     * @param {string} label - The label
     * @returns {Element} The label panel
     */
    createLabel = (label) => {
        const newPanel = document.createElement("p");
        newPanel.classList.add("generic-field", "panel");
        newPanel.style.margin = "2px";
        newPanel.style.padding = "0px";
        const newSpanLabel = document.createElement("span");
        newSpanLabel.classList.add("generic-field", "label");
        newSpanLabel.textContent = label;
        newPanel.appendChild(newSpanLabel);
        return newPanel;
    }

    /**
     * Creates a label value
     * 
     * @param {string} id - The id
     * @param {string} label - The label
     * @param {*} defaultValue - The default value
     * @param {string} valueSize - The size of the value
     * @returns {Element} The label value panel
     */
    createLabelValue = (id, label, defaultValue=null, valueSize="fs-m") => {
        const newPanel = document.createElement("p");
        newPanel.classList.add("generic-field", "panel");
        newPanel.style.margin = "2px";
        newPanel.style.padding = "0px";
        const newSpanLabel = document.createElement("span");
        newSpanLabel.classList.add("generic-field", "label");
        newSpanLabel.textContent = label;
        newPanel.appendChild(newSpanLabel);
        const newSpanBuffer = document.createElement("span");
        newSpanBuffer.classList.add("generic-field", "buffer");
        newPanel.appendChild(newSpanBuffer);
        const newSpanValue = document.createElement("span");
        newSpanValue.id = id;
        newSpanValue.classList.add("generic-field", "value");
        if (valueSize != null) {
            newSpanValue.classList.add("generic-text", valueSize);
        }
        newSpanValue.textContent = defaultValue ? defaultValue : "N/A";
        newPanel.appendChild(newSpanValue);
        return newPanel;
    }

    /**
     * Creates a button
     * @param {string} id - the id of the button
     * @param {string} label - the label of the button
     * @param {*} onClick - the function to call when the button is clicked
     * @param {*} color - the color of the button
     * @returns {Element} the button panel 
     */
    createButton = (id, label, onClick, color) => {
        const newButton = document.createElement("button");
        newButton.classList.add("generic-field", "button");
        newButton.id = id;
        if (color) newButton.style.backgroundColor = color;
        newButton.textContent = label;
        if (onClick) newButton.addEventListener("click", onClick);
        return newButton;
    }

    /**
     * Creates an input field
     * 
     * @param {string} id - the id of the input
     * @param {string|null|undefined} label - the label of the input
     * @param {*} onChange - the function to call when the input is changed
     * @returns {Element} the input field panel
     */
    createInput = (id, label=null, onChange) => {
        const newPanel = document.createElement("p");
        newPanel.classList.add("generic-field", "panel");
        newPanel.style.margin = "2px";
        newPanel.style.padding = "0px";

        if (label) {
            /* Label */
            const newSpanLabel = document.createElement("span");
            newSpanLabel.classList.add("generic-field", "label");
            newSpanLabel.textContent = label;
            newPanel.appendChild(newSpanLabel);
            
            /* Buffer */
            const newSpanBuffer = document.createElement("span");
            newSpanBuffer.classList.add("generic-field", "buffer");
            newPanel.appendChild(newSpanBuffer);
        }

        /* Input */
        const newInput = document.createElement("input");
        newInput.classList.add("generic-field", "value", "input");
        newInput.id = id;
        // newInput.type = type;
        newInput.value = "N/A";
        if (label) newInput.placeholder = label;
        if (onChange) newInput.addEventListener("change", onChange);
        newPanel.appendChild(newInput);

        return newPanel;
    }

    /**
     * Creates a progress bar
     * @param {string} id - the id of the progress bar
     * @param {string|null|undefined} label - the label of the progress bar
     * @returns {Element} the progress bar panel.
     */
    createProgress = (id, label=null) => {
        const newPanel = document.createElement("p");
        newPanel.classList.add("generic-field", "panel");

        if (label) {
            /* Label */
            const newSpanLabel = document.createElement("span");
            newSpanLabel.classList.add("generic-field", "label");
            newSpanLabel.textContent = label;
            newPanel.appendChild(newSpanLabel);
            
            /* Buffer */
            const newSpanBuffer = document.createElement("span");
            newSpanBuffer.classList.add("generic-field", "buffer");
            newPanel.appendChild(newSpanBuffer);   
        }

        /* Progress */
        const newProgress = document.createElement("progress");
        newProgress.classList.add("generic-field", "progress");
        newProgress.id = id;
        
        // @ts-ignore
        newProgress.max = "100";
        // @ts-ignore
        newProgress.value = "0";
        
        newPanel.appendChild(newProgress);
        return newPanel;
    }

    /**
     * Creates a select
     * 
     * @param {string} id 
     * @param {string} label 
     * @param {Array<{value: string, label: string}>} options
     * @returns 
     */
    createSelect = (id, label, options) => {
        const newPanel = document.createElement("p");
        newPanel.classList.add("generic-field", "panel");

        /* Label */
        const newSpanLabel = document.createElement("span");
        newSpanLabel.classList.add("generic-field", "label");
        newSpanLabel.textContent = label;
        newPanel.appendChild(newSpanLabel);

        /* Buffer */
        const newSpanBuffer = document.createElement("span");
        newSpanBuffer.classList.add("generic-field", "buffer");
        newPanel.appendChild(newSpanBuffer);

        /* Select */
        const newSelect = document.createElement("select");
        newSelect.classList.add("generic-field", "select");
        newSelect.id = id;
        options.forEach((option) => {
            const newOption = document.createElement("option");
            newOption.value = option.value;
            newOption.textContent = option.label;
            newSelect.appendChild(newOption);
        });
        newPanel.appendChild(newSelect);
        return newPanel;
    }

    /**
     * Removes the panel.
     */
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

    /**
     * Refreshes the panel.
     */
    refresh = () => {
        if (!this.getPanel()) {
            console.log("refresh:Panel not found for " + this.panelId);
            return;
        }
        this.onRefresh();
    }

    /**
     * Retrieves the panel by its ID.
     * 
     * @returns {Element|null|undefined} The panel, or null if not found.
     */
    getPanel = () => {
        return document.body.querySelector("#" + this.panelId);
    }

    /**
     * Retrieves the content panel of the panel.
     * 
     * @returns {Element|null|undefined} The content panel, or null if not found.
     */
    getContentPanel = () => {
        return this.getPanel()?.querySelector("#" + this.contentId);
    }

    /**
     * Retrieves an element by its ID from the content panel.
     * 
     * @param {string} id - The ID of the element to retrieve.
     * @returns {Element|null|undefined} The element with the specified ID, or null if not found.
     */
    getElement(id) {
        return this.getContentPanel()?.querySelector("#" + id);
    }
}