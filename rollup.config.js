const isProduction = process.env.NODE_ENV === 'production'

const plugins = isProduction
  ? [require('rollup-plugin-terser').terser()]
  : [require('rollup-plugin-serve')(), require('rollup-plugin-livereload')()]

export default () => ({
  plugins,
  input: 'src/main.js',
  output: {
    file: isProduction ? 'dist/dist/main.js' : 'dist/main.js',
  },
})
