/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const appIndex = path.resolve(__dirname, 'src', 'index.tsx');
const appHtml = path.resolve(__dirname, 'public', 'index.html');
const appBuild = path.resolve(__dirname, 'build');
const appPublic = path.resolve(__dirname, 'public');

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

function getClientEnv(nodeEnv) {
  return {
    'process.env': JSON.stringify(
      Object.keys(process.env)
        .filter((key) => /^REACT_APP/i.test(key))
        .reduce(
          (env, key) => {
            env[key] = process.env[key];
            return env;
          },
          {
            NODE_ENV: nodeEnv,
          }
        )
    ),
  };
}

module.exports = (webpackEnv) => {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';
  const isBundleAnalyze = process.env.npm_lifecycle_event === 'build:analyze';
  const clientEnv = getClientEnv(webpackEnv);

  return {
    /* 
      mode는 production, development, none 3가지 옵션이 존재
      (기본값은 production이며, 각 설정마다 내장된 최적화 옵션을 자동으로 설정하여 줌.)
    */
    mode: webpackEnv,
    entry: appIndex, // 종속성 그래프의 시작점 지정
    /* 생성한 번들을 저장할 위치 지정 */
    output: {
      path: appBuild, // 번들된 파일을 내보낼 디렉토리 위치를 지정
      filename: isEnvProduction // 번들된 파일 이름을 지정해 줌.
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/bundle.js',
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
      publicPath: '/',
    },
    /* 
      loader: webpack이 이해 할 수 있는 모듈로 변경해 주는 역할
      test: 변환 할 파일을 지정
      use: 변환 할 파일에 지정할 로더를 설정
    */
    module: {
      rules: [
        /* {
          test: /\.(sa|sc|c)ss$/,
          // 실행 순서: 맨 끝부터 시작
          use: [
            MiniCssExtractPlugin.loader,
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                config: { path: 'postcss.config.js' },
              },
            },
            'sass-loader',
          ],
        }, */
        {
          oneOf: [
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: 'url-loader',
              options: {
                limit: 10000,
                outputPath: 'static/media',
                name: '[name].[hash:8].[ext]',
              },
            },
            {
              test: /\.(ts|tsx)$/,
              exclude: /node_modules/,
              use: [
                'cache-loader',
                {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: !!isEnvDevelopment,
                  },
                },
              ],
            },
            {
              loader: 'file-loader',
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/, /\.svg$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [new TerserPlugin()], // 코드 난독화 및 공백 제거 (용량 줄이기)
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: {
        name: (entrypoint) => `runtime-${entrypoint.name}`,
      },
    },
    /* 모듈을 해석하는 방식을 .tsx를 1순위로 함. */
    resolve: {
      modules: ['node_modules'],
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
      alias: {
        '@components': path.join(__dirname, './src/components'),
        '@containers': path.join(__dirname, './src/containers'),
        '@pages': path.join(__dirname, './src/pages'),
        '@common': path.join(__dirname, './src/common'),
        '@services': path.join(__dirname, './src/services'),
        '@models': path.join(__dirname, './src/models'),
        '@assets': path.join(__dirname, './src/assets'),
        '@hooks': path.join(__dirname, './src/hooks'),
      },
    },
    /* 번들된 파일을 난독화 하거나, 압축하는데 사용 */
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[hash:8].css',
        chunkFilename: '[name].[hash:8].css',
      }),
      new HtmlWebpackPlugin({
        template: appHtml,
        favicon: path.join(__dirname, './src/assets/images/favicon.ico'),
      }),
      new webpack.DefinePlugin(clientEnv),
      new ForkTsCheckerWebpackPlugin({
        eslint: {
          files: './src/**/*.{ts,tsx,js,jsx}',
        },
      }),
      new ESLintPlugin({
        formatter: isEnvDevelopment ? 'codeframe' : isEnvProduction && 'stylish',
      }),
      new ManifestPlugin({
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce(
            (manifest, { name, path }) => ({ ...manifest, [name]: path }),
            seed
          );
          const entryFiles = entrypoints.main.filter((filename) => !/\.map/.test(filename));
          return { files: manifestFiles, entrypoints: entryFiles };
        },
      }),
      new CleanWebpackPlugin(),
      isBundleAnalyze && new BundleAnalyzerPlugin(), // code splitting 분석기
    ].filter(Boolean),
    devServer: {
      port: 3000,
      contentBase: appPublic,
      open: true,
      historyApiFallback: true,
      overlay: true,
      stats: 'errors-warnings',
      /* CORS 정책 해결 필요 시
      proxy: {
        "/": "http://localhost:3001",
      }
      */
    },
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
    /* 
      development 환경에서는 { type : "memory" }로 자동 적용.
      production 환경에서는 { type : false }로 자동 적용.
    */
    cache: {
      type: isEnvDevelopment ? 'memory' : isEnvProduction && 'filesystem',
    },
    /* yarn start & yarn build 시에 나오는 build result를 깔끔하게 보여줌.
    stats: {
      builtAt: false,
      children: false,
      entrypoints: false,
      hash: false,
      modules: false,
      version: false,
      publicPath: true,

      excludeAssets: [/\.(map|txt|html|jpg|png)$/],
      warningsFilter: [/exceed/, /performance/],

    }, 
    */
  };
};
