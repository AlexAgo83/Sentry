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

        this.subComponents = [];
        this.subPanels = [];
    }

    registerSubPanel = (panel) => {
        this.subPanels.push(panel);
    }

    getSubPanels = () => {
        return this.subPanels;
    }

    getInstance = () => {
        return this.instance;
    }

    onPrepare = () => {
        // Default onPrepare ...
        // console.log("onPrepare:Default onPreInit ...");
    }

    setOnPrepare = (func) => {
        this.onPrepare = func;
    }

    onInit = () => {
        // Default onInit ...
        // console.log("onInit:Default onInit ...");
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
            // Already initialized ...
        } else {
            /** Create new content */
            this.onPrepare();
            const newContent = document.createElement("div");
            newContent.id = this.contentId;
            newContent.style.margin = "10px";
            newContent.style.display = "flex";
            if (this.columnMode) {
                newContent.style.flexDirection = "column";
            } else newContent.style.flexDirection = "row";
            newContent.append(...this.onInit());
            panel?.appendChild(newContent);
            // console.log(`init:Panel ${this.panelId} setup`);
        }

        /** Running init for subPanels */
        if (this.subPanels.length > 0) {
            this.subPanels.forEach((panel) => {
                panel.init();
            });
        }
    }

    /**
     * Creates a label
     * 
     * @param {string} id - The id
     * @param {string} label - The label
     * @returns {Element} The label panel
     */
    createLabel = (id, label) => {
        const newPanel = document.createElement("p");
        newPanel.classList.add("generic-field", "panel");
        newPanel.style.margin = "2px";
        newPanel.style.padding = "0px";
        const newSpanLabel = document.createElement("span");
        newSpanLabel.classList.add("generic-field", "label");
        newSpanLabel.textContent = label;
        newPanel.appendChild(newSpanLabel);
        // @ts-ignore
        newPanel.targetId = this.genId(id);
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
        newSpanValue.id = this.genId(id);
        newSpanValue.classList.add("generic-field", "value");
        if (valueSize != null) {
            newSpanValue.classList.add("generic-text", valueSize);
        }
        newSpanValue.textContent = defaultValue ? defaultValue : "N/A";
        newPanel.appendChild(newSpanValue);
        // @ts-ignore
        newPanel.targetId = this.genId(id);
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
        newButton.id = this.genId(id);
        if (color) newButton.style.backgroundColor = color;
        newButton.textContent = label;
        if (onClick) newButton.addEventListener("click", onClick);
        // @ts-ignore
        newButton.targetId = this.genId(id);
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
        newInput.id = this.genId(id);
        // newInput.type = type;
        newInput.value = "N/A";
        if (label) newInput.placeholder = label;
        if (onChange) newInput.addEventListener("change", onChange);
        newPanel.appendChild(newInput);

        // @ts-ignore
        newPanel.targetId = this.genId(id);
        return newPanel;
    }

    /**
     * Creates a progress bar
     * @param {string} id - the id of the progress bar
     * @param {string|null|undefined} label - the label of the progress bar
     * @returns {Element} the progress bar panel.
     */
    createProgress = (id, label=null, onChangeInterval) => {
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
        newProgress.id = this.genId(id);
        
        
        // @ts-ignore
        newProgress.max = 100;
        // @ts-ignore
        newProgress.value = 0;

        /** Animation */
        if (onChangeInterval) {
            const loopTime = 10;
            let lastInterval = 0;
            let lastNewValue = 0;
            const intervalId = setInterval(() => {
                const rawInterval = onChangeInterval(); /* Ex: 2500 ms */
                const oldValue = newProgress.value;
                if (rawInterval.progression !== lastNewValue) {
                    newProgress.value = rawInterval.progression;
                    lastNewValue = rawInterval.progression;
                    lastInterval = rawInterval.interval;
                }
                if (rawInterval.interval > 0 && rawInterval.interval === lastInterval) {
                    const progressIncr = 100 / (rawInterval.interval / loopTime);
                    // @ts-ignore
                    newProgress.value += progressIncr;
                    if (newProgress.value >= 100) {
                        newProgress.value = 0;
                    }
                } else {
                    newProgress.value = rawInterval.progression;
                    lastInterval = rawInterval.interval;
                }
                if (!document.getElementById(newProgress.id)) {
                    clearInterval(intervalId);
                    console.log("Remove unused progress bar threads animation.");
                }
            }, loopTime);
        }
        
        newPanel.appendChild(newProgress);

        // @ts-ignore
        newPanel.targetId = this.genId(id);
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
        newSelect.id = this.genId(id);
        options.forEach((option) => {
            const newOption = document.createElement("option");
            newOption.value = option.value;
            newOption.textContent = option.label;
            newSelect.appendChild(newOption);
        });
        newPanel.appendChild(newSelect);
        // @ts-ignore
        newPanel.targetId = this.genId(id);
        return newPanel;
    }

    /**
     * Removes the panel.
     */
    remove = () => {
        if (this.subPanels.length > 0) {
            this.subPanels.forEach((panel) => {
                panel.remove();
            });
            this.subPanels = [];
        }
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
        // console.log("setOnRefresh:onRefresh set", func);
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
        if (this.subPanels.length > 0) {
            this.subPanels.forEach((panel) => {
                panel.refresh();
            });
        }
    }

    /**
     * Retrieves the panel by its ID.
     * 
     * @returns {Element|null|undefined} The panel, or null if not found.
     */
    getPanel = () => {
        return document.body.querySelector("#" + this.panelId);
    }

    getPanelId = () => {
        return this.panelId;
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

    /**
     * Registers a component with a given ID.
     * 
     * @param {Element} newElement - The element of the component.
     */
    registerComponent = (targetPanel, newElement) => {
        // @ts-ignore
        const targetId = newElement.targetId;
        if (targetId) {
            this.subComponents[targetId] = newElement;
            targetPanel.appendChild(newElement)
        } else {
            console.warn("registerComponent:targetId not found");
        }
    }
    
    /**
     * Retrieves a component by its ID.
     * 
     * @param {string} id - The ID of the component to retrieve.
     * @returns {Element|null|undefined} The component element with the specified ID, or null if not found.
     */
    getComponent = (id) => {
        return this.subComponents[id];
    }
    getComponentContent = (id) => {
        return this.getComponent(this.genId(id))?.querySelector("#"+this.genId(id));
    }

    setOnGenId = (func) => {
        this.onGenId = func;
        // console.log("setOnGenId:onGenId set", func);
    }
    onGenId = () => {
        // Default onGenId ...
        return null;
    }

    genId = (newId) => {
        const gen = this.onGenId();
        if (gen != null) return newId + "-" + gen;
        return newId;
    }
}