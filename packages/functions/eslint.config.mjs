import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/build/*", "**/node_modules/*", "**/cdk.out/*"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...eslintPluginPrettierRecommended,
    rules: {
      ...eslintPluginPrettierRecommended.rules,
      "max-len": ["error", { code: 100, ignoreUrls: true }],
    },
  },
];
