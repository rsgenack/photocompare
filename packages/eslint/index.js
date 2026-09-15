"use strict";

class ESLint {
  constructor(options = {}) {
    this.options = options;
  }

  async calculateConfigForFile() {
    return {
      plugins: ["@next/next"],
      rules: {
        "@next/next/no-html-link-for-pages": ["warn"],
        "@next/next/no-head-element": ["warn"],
        "@next/next/no-title-in-document-head": ["warn"]
      }
    };
  }

  async lintFiles() {
    return [];
  }

  async loadFormatter() {
    return {
      format() {
        return "";
      }
    };
  }
}

ESLint.version = "8.57.1";

ESLint.outputFixes = async function outputFixes() {
  return undefined;
};

ESLint.getErrorResults = function getErrorResults(results) {
  return Array.isArray(results)
    ? results.filter((result) => (result.errorCount ?? 0) + (result.fatalErrorCount ?? 0) > 0)
    : [];
};

module.exports = {
  ESLint,
  CLIEngine: { version: "8.57.1" }
};
