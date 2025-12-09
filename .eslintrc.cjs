module.exports = {
    root: true,
    env: {
        browser: true,
        es2020: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['react', 'react-hooks'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        // React rules
        'react/prop-types': 'warn', // Warn but don't error on missing PropTypes
        'react/jsx-no-target-blank': 'error',
        'react/jsx-uses-react': 'off', // Not needed with new JSX transform
        'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
        'react/no-unescaped-entities': 'warn',

        // React Hooks rules
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // General rules
        'no-unused-vars': ['warn', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        }],
        'no-console': 'warn', // Warn on console.log usage
        'prefer-const': 'warn',
        'no-var': 'error',

        // Accessibility hints
        'jsx-a11y/alt-text': 'off', // Would need eslint-plugin-jsx-a11y
    },
};
