const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const outputDirectory = 'dist/client';
const groupsOptions = {
  chunks: 'all',
  minSize: 0,
  maxSize: 300000,
  minChunks: 1,
  maxInitialRequests: 5,
  // reuseExistingChunk: true,
};

module.exports = (env, argv) => ({
    entry: {
      app: './src/client/index.jsx',
    },
    resolve: {
      alias: {
        jquery$: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.slim.js')
      },
    },
    output: {
        path: path.join(__dirname, outputDirectory),
        filename: argv.mode === 'production' ?
          '[name].bundle.min.js' :
          '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: 'react-svg-loader',
                        options: {
                            svgo: {
                                plugins: [
                                    {removeStyleElement: false}
                                ]
                            },
                            jsx: true // true outputs JSX tags
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|woff|woff2|eot|ttf)$/,
                loader: 'url-loader?limit=100000'
            }
        ]
    },
    devServer: {
      port: 3000,
      open: true,
      index: 'index.html',
      historyApiFallback: true,
      proxy: [
        {
          path: '/api',
          target: 'http://localhost:8080'
        },
        {
          path: '/ws',
          target: 'ws://localhost:8080',
          ws: true
        }
      ]
    },
    optimization: {
      minimize: argv.mode === 'production',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          react: {
            test: /(react|react-ace|react-dom|react-is|react-pluralize)[\\/]/,
            name: 'react',
            ...groupsOptions,
          },
          common: {
            test: /\@fortawesome|lodash|diff-match-patch/,
            name: 'common',
            ...groupsOptions,
          },
          ace: {
            test: /[\\/]node_modules[\\/](brace|react-ace[\\/]lib)[\\/]/,
            name: 'ace',
            ...groupsOptions,
          },
          app: {
            test: /index\.jsx/,
            name: 'app',
            ...groupsOptions,
            priority: -20,
          },
        }
      }
    },
    node: {
      fs: 'empty'
    },
    plugins: [
      new webpack.DefinePlugin({ // <-- key to reducing React's size
        'process.env': {
          'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
        }
      }),
      new CleanWebpackPlugin([outputDirectory]),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        custom: {
          googleAnalytics: process.env.VALIDATOR_GOOGLE_ANALYTICS,
        },
      }),
      new CopyWebpackPlugin([
        { from: './public/favicon', to: 'favicon' }
      ]),
    ]
});
