import path from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

// Utils
import { tsPathsToWebpackAlias } from './tsconfig.utils';

const config: Configuration = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        index: path.resolve(__dirname, './index.tsx'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].bundle.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            ...tsPathsToWebpackAlias(),
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/i,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(sc|sa|c)ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
    },
    plugins: [
        new CleanWebpackPlugin({
            // Prevent index.html get removed on rebuild in watch mode
            cleanStaleWebpackAssets: false,
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './index.html'),
        }),
    ],
};

export default config;
