import commonjs from '@rollup/plugin-commonjs'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import livereload from 'rollup-plugin-livereload'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const { ROLLUP_WATCH } = process.env

const packageJson = require('./package.json')

export default {
	input: 'src/index.js',
	output: [
		{
			file: packageJson.main,
			format: 'cjs',
			sourcemap: true,
			exports: 'default',
		},
		{
			file: packageJson.module,
			format: 'esm',
			sourcemap: true,
		},
	],
	plugins: [
		peerDepsExternal(),
		resolve(),
		commonjs(),
		!ROLLUP_WATCH && terser(),
		ROLLUP_WATCH && livereload(),
	],
}
