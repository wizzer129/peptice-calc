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
		languageOptions: {
			globals: {
				window: 'readonly',
				document: 'readonly',
				requestAnimationFrame: 'readonly',
				cancelAnimationFrame: 'readonly',
				performance: 'readonly',
			},
		},
	},
	{
		files: ['**/*.js'],
		rules: {
			indent: ['error', 'tab'],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'comma-dangle': ['error', 'always-multiline'],
			'no-console': 'warn',
			'no-unused-vars': 'warn',
		},
	},
	{
		files: ['**/*.vue'],
		rules: {
			indent: 'off',
			'vue/script-indent': [
				'error',
				'tab',
				{ baseIndent: 1, switchCase: 1 },
			],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'comma-dangle': ['error', 'always-multiline'],
			'no-console': 'warn',
			'no-unused-vars': 'warn',
			'vue/multi-word-component-names': 'off',
		},
	},
];
