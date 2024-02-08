const {resolve} = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');
/** @type {import('eslint').Linter.Config} */
module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'es2017': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'project': 'tsconfig.json',
    'tsconfigRootDir': '.',
  },
  'plugins': [
    '@typescript-eslint',
    'prettier',
    'jest',
  ],
  'rules': {
    'prettier/prettier': 'off',
    'max-len': [
      'error',
      {
        'code': 100,
      },
    ],
    'jest/valid-expect': [
      'error',
      {
        'maxArgs': 2,
      },
    ],
  },
};


