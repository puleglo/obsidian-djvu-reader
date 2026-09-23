import esbuild from 'esbuild';
import process from 'node:process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const production = process.argv[2] === 'production';
const watch = process.argv.includes('--watch');

/** Папка, куда складывается готовый плагин (её содержимое копируется в .obsidian/plugins/…). */
const OUT_DIR = 'dist/obsidian-djvu-viewer';

const shared = {
	bundle: true,
	external: ['obsidian', 'electron', 'node:*', '@codemirror/*', '@lezer/*'],
	platform: 'browser',
	target: 'es2020',
	format: 'cjs',
	logLevel: 'info',
	sourcemap: production ? false : 'inline',
	minify: production,
	treeShaking: true,
	// vendored djvu.js остаётся кодом (для require), а скрипт воркера — текстом
	loader: { '.txt': 'text' },
	legalComments: 'none',
	define: { 'process.env.NODE_ENV': production ? '"production"' : '"development"' },
};

mkdirSync(OUT_DIR, { recursive: true });

/** Копирует манифест/стили/иконку и проставляет в них версию из package.json. */
function copyAssets() {
	const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

	const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
	manifest.version = pkg.version;
	writeFileSync(`${OUT_DIR}/manifest.json`, JSON.stringify(manifest, null, '\t') + '\n');

	const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
	versions[pkg.version] = manifest.minAppVersion;
	writeFileSync(`${OUT_DIR}/versions.json`, JSON.stringify(versions, null, '\t') + '\n');

	copyFileSync('styles.css', `${OUT_DIR}/styles.css`);
	copyFileSync('assets/icon.svg', `${OUT_DIR}/icon.svg`);
	copyFileSync('README.md', `${OUT_DIR}/README.md`);
}

/** vendor/djvu-worker.js → vendor/djvu-worker.txt (воркер вставляется в Blob как текст). */
function syncWorkerSource() {
	copyFileSync('vendor/djvu-worker.js', 'vendor/djvu-worker.txt');
}

const contexts = [];

const pluginBuild = {
	...shared,
	entryPoints: ['src/main.ts'],
	outfile: `${OUT_DIR}/main.js`,
};

const harnessBuild = {
	...shared,
	entryPoints: ['dev/engine-entry.ts'],
	outfile: 'dev/engine-bundle.mjs',
	format: 'esm',
	platform: 'node',
	sourcemap: 'inline',
	minify: false,
};

if (watch) {
	const ctx = await esbuild.context(pluginBuild);
	await ctx.watch();
	contexts.push(ctx);
	console.log('[esbuild] watch-режим запущен');
} else {
	syncWorkerSource();
	await esbuild.build(pluginBuild);
	copyAssets();
	console.log(`[esbuild] готово → ${OUT_DIR}`);
}

if (process.argv.includes('--harness')) {
	syncWorkerSource();
	await esbuild.build(harnessBuild);
	console.log('[esbuild] тестовая обвязка собрана → dev/engine-bundle.mjs');
}

// в watch-режиме не выходим — esbuild следит за файлами
