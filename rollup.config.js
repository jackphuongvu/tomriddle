import { DEFAULT_EXTENSIONS } from '@babel/core';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

const isProduction = process.env.NODE_ENV === 'production';

const commonPlugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
    'process.env.npm_package_version': JSON.stringify(
      process.env.npm_package_version
    ),
  }),
  typescript(),
  nodeResolve(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
    extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
  }),
];

const plugins = isProduction
  ? [...commonPlugins, require('rollup-plugin-terser').terser()]
  : commonPlugins;

export default () => [
  {
    plugins,
    input: `src/index.ts`,
    output: {
      // vercel builds to dist then copies dist to root, so
      // we need to build to dist/dist... madness
      file: isProduction ? `dist/dist/main.js` : `dist/main.js`,
      sourcemap: !isProduction,
      format: 'cjs',
    },
  },
  {
    plugins,
    input: `src/sw.ts`,
    output: {
      // vercel builds to dist then copies dist to root, so
      // we need to build to dist/dist... madness
      file: isProduction ? `sw.js` : `sw.js`,
      sourcemap: false,
      format: 'cjs',
    },
  },
];
