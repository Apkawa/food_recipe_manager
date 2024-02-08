import webpack from 'webpack';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import {TsconfigPathsPlugin} from 'tsconfig-paths-webpack-plugin';

import type {Configuration as DevServerConfiguration} from 'webpack-dev-server';

const devServer: DevServerConfiguration = {
  static: {
    directory: path.join(__dirname, 'dist'),
  },
  compress: true,
  port: 9000,
};
const config: webpack.Configuration = {
  entry: {},
  target: 'browserslist',
  devtool: false,
  devServer,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: require.resolve('./tsconfig-ts-loader.json'),
          },
        },
      },
      {
        test: /\.svg$/,
        loader: 'raw-loader',
        // type: 'asset/inline'
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.ts', '.js'],
    fallback: {
      path: require.resolve('path-browserify'),
    },
    plugins: [new TsconfigPathsPlugin()],
  },
  optimization: {
    // We no not want to minimize our code.
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            defaults: false,
            unused: true,
          },
          mangle: false,
          format: {
            comments: false,
            beautify: true,
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};

export default config;
