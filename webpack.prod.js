const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/index.ts",
    output: {
        library: 'transliteration-input-tools',
        libraryTarget: 'umd',  
        path: path.resolve(__dirname, "dist"),
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
    }
};
