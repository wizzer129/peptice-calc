import js from '@eslint/js';
import vue from 'eslint-plugin-vue';

export default [
    {
        ignores: [
            'dist/**',
            'dist-ssr/**',
            'build/**',
            'node_modules/**',
            '.git/**',
            '.vscode/**',
            '.idea/**',
            '*.log',
            '.env',
            '.env.local',
        ],
    },
    js.configs.recommended,
    ...vue.configs['flat/recommended'],
    {
        files: ['**/*.{js,vue}'],
        rules: {
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-console': 'warn',
            'no-unused-vars': 'warn',
            'vue/multi-word-component-names': 'off',
        },
    },
];
