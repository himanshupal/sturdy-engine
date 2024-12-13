/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  testMatch: ["**/test/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
