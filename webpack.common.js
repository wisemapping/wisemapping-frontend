
/** @type {import('webpack').Configuration} */
module.exports = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    optimization: {
        usedExports: true,
    },
    stats: {
        errorDetails: true,
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(tsx|ts)?$/,
                use: 'ts-loader',
                exclude: '/node_modules/',
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                type: 'asset/inline',
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            }
        ],
    },
};
