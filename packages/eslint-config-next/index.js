"use strict";

module.exports = {
  plugins: ["@next/next"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2021: true
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {}
};
