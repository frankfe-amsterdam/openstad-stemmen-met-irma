const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

// Specified to public path of backend
outputA = path.resolve(process.cwd(), '../backend/public');

/// Common configuration for serverA and serverB
var config = {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                exclude: [/images/],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name][ext]',
                            outputPath: 'assets/fonts/'
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[name][ext]'
                }
            },
            {
                test: /\.(html)$/,
                use: ['html-loader']
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new NodePolyfillPlugin()
    ]
};

var serverAConfig = Object.assign({}, config, {
    name: 'serverA',
    entry: {
        index: './src/user/index.js',
        'admin/index': './src/admin/index.js',
        'admin/login': './src/admin/login.js'
    },
    output: {
        path: outputA,
        filename: '[name].js'
    },
    // do this programmatically...
    plugins: config.plugins.concat([
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/user/index.html',
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            filename: 'admin/index.html',
            template: './src/admin/index.html',
            chunks: ['admin/index']
        }),
        new HtmlWebpackPlugin({
            filename: 'admin/login.html',
            template: './src/admin/login.html',
            chunks: ['admin/login']
        })
    ])
});

module.exports = [serverAConfig];
