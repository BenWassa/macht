import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const BANNED_VOCAB = [
  "telemetry",
  "pathology",
  "biomechanical",
  "directive",
  "reconstitution",
].join("|");

const bannedVocabRule = [
  "warn",
  {
    selector: `JSXText[value=/${BANNED_VOCAB}/i]`,
    message: "Banned vocabulary per DESIGN.md §Voice.",
  },
  {
    selector: `Literal[value=/${BANNED_VOCAB}/i]`,
    message: "Banned vocabulary per DESIGN.md §Voice.",
  },
];

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "max-lines": [
        "warn",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
      "no-restricted-syntax": bannedVocabRule,
    },
  },
  {
    files: ["src/state/**/*.ts"],
    rules: {
      "max-lines": [
        "warn",
        { max: 120, skipBlankLines: true, skipComments: true },
      ],
    },
  },
);
