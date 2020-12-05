const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    app: [path.join(__dirname, 'src', 'index.tsx')]
  },
  target: 'web',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: '/node_modules/'
      },
      {
        test: /\.jsx?$/,
        exclude: '/node_modules/',
        resolve: {
          extensions: [".js", ".jsx"]
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  "targets": {
                    "esmodules": true
                  }
                }
              ],
              '@babel/preset-react',
            ],
          }
        },
      },
      {
        test: /\.svg$/,
        exclude: /\.x.svg$/,
        loader: 'svg-url-loader',
      },

      // Inline PNGs in Base64 if it is smaller than 10KB; otherwise, emmit files using file-loader.
      {
        test: /\.png$/,
        loader: 'url-loader',
        options: { mimetype: 'image/png', limit: 10000, name: '[name]-[hash:6].[ext]' },
      },

      // Style loader
      {
        test: /\.css$/i,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
        }],
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html')
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    hot: true,
    historyApiFallback: true,
  }
}
