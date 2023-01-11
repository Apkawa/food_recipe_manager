/** @type {import('ts-jest').JestConfigWithTsJest} */
// const ts_preset = require('ts-jest/jest-preset');
const preset = require('./jest.config');
module.exports = {
  ...preset,
  preset: 'jest-puppeteer',
  testEnvironment: './.jest/puppeteer/PuppeteerEnvironment.ts',
  globalSetup: require.resolve('jest-environment-puppeteer/setup'),
  globalTeardown: require.resolve('jest-environment-puppeteer/teardown'),
};
