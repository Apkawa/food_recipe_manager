/** @type {import('ts-jest').JestConfigWithTsJest} */
// const ts_preset = require('ts-jest/jest-preset');

// import tsConfig from './tsconfig.json';
//
// function makeModuleNameMapper(srcPath, tsconfigPath) {
//   // Get paths from tsconfig
//   const {paths} = tsConfig.compilerOptions;
//
//   const aliases = {};
//
//   // Iterate over paths and convert them into moduleNameMapper format
//   Object.keys(paths).forEach((item) => {
//     const key = item.replace('/*', '/(.*)');
//     const path = paths[item][0].replace('/*', '/$1');
//     aliases[key] = srcPath + '/' + path;
//   });
//   return aliases;
// }

const path  = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[t]s'],
  testPathIgnorePatterns: ['/node_modules/', 'dist', 'tests/e2e/'],
  resetMocks: false,
  setupFiles: ['jest-localstorage-mock', require.resolve('./.jest/setupEnv.ts')],
  setupFilesAfterEnv: [require.resolve('./.jest/jest.setup.ts')],
  reporters: [
    require.resolve('./.jest/OutputConsoleOnFailureOnlyReporter.js'),
    require.resolve('../../node_modules/@jest/reporters/build/SummaryReporter.js'),
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@app/(.*)$': path.resolve(__dirname, './src/food_recipe/$1'),
    '^@tests/(.*)$': path.resolve(__dirname, './tests/$1'),
  },
};
