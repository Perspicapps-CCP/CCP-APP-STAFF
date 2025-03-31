// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = tseslint.config(
  // Configuraciones globales
  {
    ignores: ["node_modules/**", "dist/**", ".angular/**", "coverage/**"]
  },
  // Configuración para archivos TypeScript
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettierConfig,
    ],
    plugins: {
      prettier: prettier,
    },
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Reglas de Prettier
      "prettier/prettier": ["error", {
        "singleQuote": true,
        "trailingComma": "all",
        "printWidth": 100,
        "tabWidth": 2,
        "semi": true,
        "bracketSpacing": true,
        "arrowParens": "avoid",
        "endOfLine": "auto"
      }],
      // Reglas adicionales de TypeScript (personalizables)
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  // Configuración para archivos HTML
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      prettierConfig,
    ],
    plugins: {
      prettier: prettier,
    },
    rules: {
      "prettier/prettier": ["error", {
        "parser": "angular",
        "htmlWhitespaceSensitivity": "css",
        "printWidth": 100
      }],
    },
  }
);
