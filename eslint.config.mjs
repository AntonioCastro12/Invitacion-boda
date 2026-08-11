import eslint from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  { ignores: ["dist/**", "node_modules/**", "out/**", ".next/**"] },
  eslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ["src/**/*.{js,jsx}", "vite.config.js"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    settings: { react: { version: "detect" } },
    rules: {
      "react/prop-types": "off",
      "react-hooks/set-state-in-effect": "off",
      "jsx-a11y/media-has-caption": "off",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  }
];
