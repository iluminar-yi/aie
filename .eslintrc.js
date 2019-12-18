module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: [
        'react-hooks',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        jsx: true,
        project: './tsconfig.json',
    },
    env: {
        browser: true,
        node: true,
    },
    globals: {
        __static: true,
    },
    rules: {
        quotes: ['error', 'single'],
        'comma-dangle': ['error', 'always-multiline'],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
};
