const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

// Specified to public path of backend
outputA = path.resolve(process.cwd(), '../backend/public');

/// Common configuration for serverA and serverB
var config = {
    mode: 'development',
    experiments: { asset: true },
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
        })
    ]
};

var serverAConfig = Object.assign({}, config, {
    name: 'serverA',
    entry: {
        userIndex: './src/user/index.js',
        adminIndex: './src/admin/index.js',
        login: './src/admin/login.js',
        election: './src/admin/election.js'
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
            chunks: ['userIndex']
        }),
        new HtmlWebpackPlugin({
            filename: 'admin/index.html',
            template: './src/admin/index.html',
            chunks: ['adminIndex']
        }),
        new HtmlWebpackPlugin({
            filename: 'admin/login.html',
            template: './src/admin/login.html',
            chunks: ['login']
        }),
        new HtmlWebpackPlugin({
            filename: 'admin/election.html',
            template: './src/admin/election.html',
            chunks: ['election']
        })
    ]),
    resolve: {
        modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
      }
});

module.exports = [serverAConfig];
