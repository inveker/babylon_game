const path = require("path");
const rooDir = '../';
const distDir = rooDir + 'dist/';

module.exports = {
    entry: "./index.ts",
    output: {
        path: path.resolve(distDir, 'back'),
        filename: "server.js",
    },
    target: 'node',
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
};