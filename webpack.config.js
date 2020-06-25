const webpack = require('webpack')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin'); // generate HTML file from src to public
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');  // used in combo w/ webpack dev server to reload changes in our templates. kind of a proxy
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // extracts css into separate files. supports on depand loading of css. async loading, no duplicate compilation
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // searches for CSS assets and optimize/minimize by default
const MinifyPlugin = require('babel-minify-webpack-plugin') // babel based minifier
// const OptimizeThreePlugin = require('@vxna/optimize-three-webpack-plugin')

const development = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: development ? "development" : "production", // webpack 4 runs optimizations depending on prod, dev, or none
  entry: './src/js/main.js',  // tells webpack where to begin building
  output: {
    filename: 'js/[name].[hash].js', // what to name file
    path: path.resolve(__dirname, 'public') // where to emit bundles it creates
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(glsl|frag|vert)$/,
        use: 'raw-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(glsl|frag|vert)$/,
        use: 'glslify-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          development ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      { 
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      use: ['url-loader?limit=100000']
      }
    ]
},
  plugins: [
    // new CleanWebpackPlugin(), // only files generated from the build, no more old files, look at adding in prod? only for certain directories?
    new HtmlWebpackPlugin({ // generate HTML file, auto injects generated bundles 
      template: './src/index.html',
      inject: false // inject all assets into the given template or template content
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      proxy: 'http://localhost:8080/',
      open: false,
      files: [
        {
          match: ['**/*.html'],
          fn: event => {
            if (event === 'change') {
              const bs = require('browser-sync').get(
                'bs-webpack-plugin'
              )
              bs.reload()
            }
          }
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css'
    })
    // new OptimizeThreePlugin()
  ],
  devServer: {
    hot: true, // tell webpack-dev-server we're using hot module reloading
    contentBase: path.resolve(__dirname, 'public'),
  },
  devtool: development ? 'eval-cheap-source-map' : false, // add meta info for dev tools
  optimization: { // override default minimizer
    minimizer: [
      new MinifyPlugin(),
      new OptimizeCssAssetsPlugin()
    ],
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all', // include all types of chunks. chunks can be shared between async and non-async chunks
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) { // use a custom name, merges common modules/vendors into single chunk
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          },
        }
      }
    }
  }
}