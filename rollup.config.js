import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import preprocess from 'svelte-preprocess';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/App.js',
	output: {
		file: 'public/bundle.js',
		format: 'iife',
		name: 'app',
		sourcemap: false
	},
	plugins: [
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),
		svelte({
			preprocess: preprocess(),
			dev: !production,
			css: css => {
				css.write('bundle.css');
			}
		}),
		production && terser()
	],
	watch: {
		clearScreen: false
	},
}
