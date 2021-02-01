import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

const isProduction = process.env.NODE_ENV === 'production';

const commonPlugins = [
  nodeResolve(),
  replace({
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
    'process.env.npm_package_version': JSON.stringify(
      process.env.npm_package_version
    ),
  }),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
  }),
];

const plugins = isProduction
  ? [...commonPlugins, require('rollup-plugin-terser').terser()]
  : [
      ...commonPlugins,
      require('rollup-plugin-serve')({
        open: true,
      }),
      require('rollup-plugin-livereload')(),
    ];

export default () => ({
  plugins,
  input: `src/index.js`,
  output: {
    // vercel builds to dist then copies dist to root, so
    // we need to build to dist/dist... madness
    file: isProduction ? `dist/dist/main.js` : `dist/main.js`,
    sourcemap: !isProduction,
    format: 'cjs',
  },
});
