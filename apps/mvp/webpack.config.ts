import webpack from 'webpack';
import path from 'path';
import {TsconfigPathsPlugin} from 'tsconfig-paths-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import type {Configuration as DevServerConfiguration} from 'webpack-dev-server';

const devServer: DevServerConfiguration = {
  static: {
    directory: path.join(__dirname, 'dist'),
  },
  compress: true,
  port: 9000,
};
const config: webpack.Configuration = {
  entry: {
    index: require.resolve('./src/index.entry.ts'),
  },
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
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new HtmlWebpackPlugin({
      // Also generate a test.html
      filename: 'index.html',
      template: 'assets/index.html',
      minify: false,
      chunks: ['index'],
    }),
  ],
};

console.log('ENTRY:', config.entry);

export default config;
