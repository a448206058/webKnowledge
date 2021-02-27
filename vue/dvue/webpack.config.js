const HtmlWebpackPlugin = require('html-webpack-plugin')

// module.exports = {
//   mode: 'development',
//   devServer: {
//     host: 'localhost',
//     port: 9987,
//     hot: true,
//     open: true
//   },
//   entry: ['./src/index.js', './src/main.js'],
//   plugins: [
//     new HtmlWebpackPlugin({
//       // 打包输出HTML
//       title: 'dVue',
//       filename: 'index.html',
//       template: 'src/index.html'
//     })
//   ]
// }

module.exports = {
  mode: 'development',
  devServer: {
    host: 'localhost',
    port: 9987,
    hot: true,
    open: true
  },
  entry: ['./src/test/index.js', './src/test/main.js'],
  plugins: [
    new HtmlWebpackPlugin({
      // 打包输出HTML
      title: 'dVue',
      filename: 'index.html',
      template: 'src/test/index.html'
    })
  ]
}
