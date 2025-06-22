// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// utils.js

/**
 * @returns The user's locale in the format "en-US"
 */
export function getLocale() {
    return navigator?.languages[0];
}

export function formatDate(date) {
    return date.toLocaleDateString(getLocale());
}