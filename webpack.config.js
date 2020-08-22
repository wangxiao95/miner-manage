const webpack = require('webpack');
const path = require('path')
const fs = require('fs')
const webpackDevServer = require("webpack-dev-server")
const cmd = require('node-cmd')

let externals = _externals()

const config = {
  entry: {
    app: './src/index.js',
  },
  target: 'node',
  output: {
    path: path.resolve('./dist'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  externals: externals,
  node: {
    console: true,
    global: true,
    process: true,
    Buffer: true,
    __filename: true,
    __dirname: true,
    setImmediate: true
  },
  module: {
    rules: [
      {
        test: /\.js|jsx|ts|tsx?$/,
        use: {
          loader: 'babel-loader'
        },
        include: [path.resolve('./src')]
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "async",   // 共有3个值"initial"，"async"和"all"。配置后，代码分割优化仅选择初始块，按需块或所有块
      maxSize: 1024 * 5 * 100
    }
  },
}

function _externals() {
  let manifest = require('./package.json');
  let dependencies = manifest.dependencies;
  let externals = {};
  for (let p in dependencies) {
    externals[p] = 'commonjs ' + p
  }
  return externals
}

const compiler = webpack(config)

module.exports = config

if (process.env.NODE_ENV === 'prod') {
  return
}

/**
 * 将dev模式下的编译文件写入dev文件夹，便于配合nodemon实现热重启
 */
function writeCompileToDev(stats) {
  const assets = stats.assets;
  let file, data;
  Object.keys(assets).forEach(key => {
    file = path.resolve(__dirname, './dev', key);
    data = assets[key].source();
    fs.writeFileSync(file, data);
  });
  cmd.run('nodemon ./dev/index.js')
}

/**
 * 方法1：使用webpack.ProgressPlugin
 */
// compiler.apply(new webpack.ProgressPlugin());
//
// compiler.watch({
//     port: 9000
//   },
//   (err, stats) => {
//     writeCompileToDev(stats.compilation)
//   });


/**
 * 方法2：使用webpack钩子函数
 */
new webpackDevServer(compiler, {
  compress: true,
  port: 9000,
})
compiler.hooks.emit.tap('sync', writeCompileToDev)
compiler.hooks.done.tap('sync', () => {
  console.log('------- compile done -------')
})
