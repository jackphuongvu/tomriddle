const isProduction = process.env.NODE_ENV === 'production'

const plugins = isProduction
  ? [require('rollup-plugin-terser').terser()]
  : [require('rollup-plugin-serve')({
    open: true,
  }), require('rollup-plugin-livereload')()]

const main = 'main.js'

export default () => ({
  plugins,
  input: `src/${main}`,
  output: {
    // vercel builds to dist then copies dist to root, so 
    // we need to build to dist/dist... madness
    file: isProduction ? `dist/dist/${main}` : `dist/${main}`,
  },
})
