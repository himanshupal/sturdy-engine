/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  testMatch: ["**/__test__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};
