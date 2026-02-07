import js from "@eslint/js";
import parser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
    {
        ignores: ["dist", "node_modules", "public"]
    },
    {
        files: ["**/*.{ts,tsx}", "src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}", "logics/**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser,
            globals: {
                ...globals.browser,
                ...globals.node,
                JSX: "readonly",
                __APP_VERSION__: "readonly",
                __ASSETS_PATH__: "readonly",
                __PROD_RENDER_API_BASE__: "readonly"
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            react,
            "react-hooks": reactHooks
        },
        settings: {
            react: {
                version: "detect"
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tsPlugin.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off"
        }
    },
    {
        files: ["tests/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.vitest,
                JSX: "readonly"
            }
        }
    }
];
