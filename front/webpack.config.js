const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const rooDir = '../';
const distDir = rooDir + 'dist/';

module.exports = {
    entry: "./index.ts", //path to the main .ts file
    output: {
        path: path.resolve(distDir, 'front'),
        filename: "js/bundleName.js", //name for the js file that is created/compiled in memory
    },
    resolve: {
        extensions: [".ts", ".js", "vue"],
        modules: ['node_modules']
    },
    devServer: {
        host: "0.0.0.0",
        port: 8080, //port that we're using for local host (localhost:8080)
        disableHostCheck: true,
        contentBase: path.resolve(rooDir, "public"), //tells webpack to serve from the public folder
        publicPath: "/",
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|babylon)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: -1
                        }
                    }
                ]
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        }),
        new VueLoaderPlugin(),
        new CleanWebpackPlugin(),
    ]
};