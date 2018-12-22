const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    resolve: {
        alias: {
            core: path.resolve(__dirname, "src/core"),
            client: path.resolve(__dirname, "src/client"),
            server: path.resolve(__dirname, "src/server"),
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/client/index.html'
        }),
        new CopyWebpackPlugin([{
            from: './src/client/assets',
            to: 'assets/',
            toType: 'dir'
        }])
    ],
    entry: './src/client/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        }]
    }
};