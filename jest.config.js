/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/functions", "<rootDir>/layers"],
  testMatch: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: ["functions/**/src/**/*.ts", "layers/**/src/**/*.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleNameMapper: {
    "^common/(.*)$": "<rootDir>/layers/common/src/$1",
  },
};
