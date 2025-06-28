// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it


// @ts-check
// assetManager.js

import { CoreManager } from "./coreManager"

let parseAssetsPath = () => { 
    try {
        // @ts-ignore
        return __ASSETS_PATH__;
    } catch (error) {
        /* Default debug value */
        return "/public/img/";
    }
}
export const STATIC_ASSET_FOLDER = parseAssetsPath();

export const STATIC_IC_COMBAT = "ic_combat.png";
export const STATIC_IC_COOKING = "ic_cooking.png";
export const STATIC_IC_EXCAVATION = "ic_excavation.png";
export const STATIC_IC_HUNTING = "ic_hunting.png";
export const STATIC_IC_METALWORK = "ic_metalWork.png";

export class AssetManager extends CoreManager {

    constructor(instance) {
        super(instance);
    }

    /**
     * Loads a resource from the static asset folder.
     * @param {string} staticRess - The name of the static resource.
     * @returns {string} The full path to the static resource.
     */
    loadRess = (staticRess) => {
        return STATIC_ASSET_FOLDER + staticRess;
    }
}