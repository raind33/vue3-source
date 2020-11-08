import babel from 'rollup-plugin-babel'
import server from 'rollup-plugin-serve'

export default {
  input: './src/index.js',
  output: {
    format: 'umd',
    name: 'Vue', // 打包出的全局变量名字
    file: 'dist/umd/vue.js',
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    server({
      port: 3000,
      contentBase: '',
      openPage: '/index.html'
    })
  ]
}