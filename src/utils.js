// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// utils.js


/**
 * Returns an array of strings representing the user's locales. The array is
 * empty if the user's locale cannot be determined.
 *
 * @returns {readonly string[]} An array of locale strings, or an empty array.
 */
export function getLocales() {
    if (typeof navigator !== "undefined" && navigator?.languages && navigator.languages.length > 0) {
        return navigator.languages;
    }
    return [];
}

/**
 * Returns the user's locale, as a string (e.g. "en-US"). If the user's locale
 * cannot be determined, returns null.
 *
 * @returns {string|null|undefined} The user's locale, or null if it cannot be determined.
 */
export function getLocale() {
    if (typeof navigator !== "undefined" && navigator?.languages && navigator.languages.length > 0) {
        return navigator.languages[0];
    }
    return null;
}

/**
 * Formats a date object into a locale-aware string representation of the date and time.
 * 
 * @param {Date} date - The date object to format.
 * @returns {string} A string representing the formatted date and time based on the user's locale.
 */
export function formatDateTime(date) {
    return date.toLocaleString(getLocales());
}


/**
 * Formats a date object into a locale-aware string representation of the date.
 * 
 * @param {Date} date - The date object to format.
 * @returns {string} A string representing the formatted date based on the user's locale.
 */
export function formatDate(date) {
    return date.toLocaleDateString(getLocales());
}
