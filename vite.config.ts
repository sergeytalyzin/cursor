import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
	plugins: [
		react(),
		// Показывает ESLint-ошибки прямо в терминале при dev/build
		eslint({
			cache: false,
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['node_modules'],
			failOnWarning: false, // Не останавливать при предупреждениях
			failOnError: false, // Не останавливать при ошибках
			emitWarning: true,
			emitError: true,
		}),
	],
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
			scss: {
				// пример, если хочешь автодобавлять переменные/миксины
				additionalData: `@use "sass:color";`,
			},
		},
	},
});
