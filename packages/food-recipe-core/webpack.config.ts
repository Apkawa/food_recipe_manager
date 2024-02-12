import webpack from 'webpack';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import {TsconfigPathsPlugin} from 'tsconfig-paths-webpack-plugin';

// TODO подсмотреть как реализована сборка библиотек в других проектов

const config: webpack.Configuration = {
  entry: {
    'food-recipe-core': path.resolve(__dirname, 'src/index.ts'),
  },
  mode: 'development',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: require.resolve('./tsconfig.json'),
          },
        },
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
  plugins: [],
};

export default config;
