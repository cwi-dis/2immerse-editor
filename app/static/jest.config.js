module.exports = {
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*\\.(test|spec))\\.(ts|tsx|js)$",
  "setupFilesAfterEnv": [
    "<rootDir>/__tests__/setup.ts"
  ],
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "json"
  ]
};
