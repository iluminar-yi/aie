const isCi = process.env.CI === 'true' || process.env.CI === 'True';

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:react/recommended',
    // Currently not working, need to define manually
    // 'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:jest/all',
  ],
  plugins: ['react-hooks'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    jsx: true,
    tsconfigRootDir: '.',
  },
  env: {
    browser: true,
    node: true,
    es2017: true,
    jest: true,
  },
  globals: {
    __static: true,
  },
  rules: {
    'no-console': isCi ? 'error' : 'warn',
    'object-shorthand': ['error', 'always'],
    'one-var': ['error', 'never'],
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
    yoda: ['error', 'never', { exceptRange: true }],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
      },
    ],
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
