const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

module.exports = {
    mode: "development",
    entry: "./src/index.ts",
    output: {
        library: 'transliteration-input-tools',
        libraryTarget: 'umd',      
        path: path.resolve(__dirname, "dev"),
        filename: "transliteration-input.bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js", ".html", ".scss", ".css"]
    },
    plugins: [
        new WriteFilePlugin(),
        new CopyWebpackPlugin([
            {
                from: "./test/index.html",
                to: "index.html",
                toType: "file"
            }
        ])
    ],
    watch: true,
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 8000
    }
};
