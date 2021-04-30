import commonjs from '@rollup/plugin-commonjs'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import livereload from 'rollup-plugin-livereload'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'

const { ROLLUP_WATCH } = process.env

const packageJson = require('./package.json')
const extensions = ['.js', '.jsx']

export default {
	input: 'src/index.js',
	output: [
		{
			file: packageJson.main,
			format: 'cjs',
			sourcemap: true,
		},
		{
			file: packageJson.module,
			format: 'esm',
			sourcemap: true,
		},
	],
	plugins: [
		peerDepsExternal(),
		resolve({
			extensions,
		}),
		babel({
			exclude: 'node_modules/**',
			presets: ['@babel/env', '@babel/preset-react'],
			babelHelpers: 'bundled',
			extensions,
		}),
		commonjs(),
		!ROLLUP_WATCH && terser(),
		ROLLUP_WATCH && livereload(),
	],
}
