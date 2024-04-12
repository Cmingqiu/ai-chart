const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader/lib');

const resolve = filename => path.resolve(__dirname, filename);

module.exports = env => {
  return {
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? false : 'source-map',
    entry: './src/main.js',
    output: {
      filename: '[name]_[chunkhash:5].js',
      path: resolve('dist')
    },
    resolve: {
      alias: {
        '@': resolve('src')
      },
      extensions: ['.js', '.vue', '.scss']
    },
    module: {
      rules: [
        {
          test: /\.js$/i,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.scss$/i,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.vue$/i,
          loader: 'vue-loader'
        },
        {
          test: /\.(png|jpg)$/i,
          loader: 'url-loader',
          options: {
            limit: 1024 * 10,
            name: '[name].[hash:8].[ext]',
            outputPath: '/images',
            publicPath: '/images',
            esModule: false
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: resolve('public/index.html')
      }),
      new VueLoaderPlugin()
    ],
    devServer: {
      open: true,
      proxy: {
        '/stream': {
          target: 'http://localhost:8844',
          onProxyReq(proxyReq, req, res) {
            console.log(
              `原理路径:${req.originUrl}，代理后路径：${req.url} | ${req.baseUrl}`
            );
          }
        },
        '/api': {
          target: 'http://localhost:3000'
        }
      }
    }
  };
};
