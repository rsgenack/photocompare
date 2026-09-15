"use strict";

const baseConfig = {
  plugins: ["@next/next"],
  rules: {}
};

module.exports = {
  meta: {
    name: "@next/eslint-plugin-next",
    version: "15.2.4"
  },
  rules: {},
  configs: {
    recommended: {
      ...baseConfig
    },
    "core-web-vitals": {
      ...baseConfig,
      rules: {
        ...baseConfig.rules
      }
    }
  }
};
