const path = require('path');
const webpack = require('webpack');

const NodemonPlugin = require('nodemon-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const CopyPlugin = require('copy-webpack-plugin');

function getPlugins (mode) {
    const plugins = [
        new webpack.ProgressPlugin(),
        new webpack.ProvidePlugin({
            $     : 'jquery',
            jQuery: 'jquery'
        }),
        new CleanWebpackPlugin({verbose: true}),
        new CopyPlugin({
            patterns: [
                {
                    from: __dirname + '/client/src/img',
                    to  : __dirname + '/client/dist/img'
                },
                {
                    from: __dirname + '/client/src/svg',
                    to  : __dirname + '/client/dist/svg'
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
        })
    ];

    if (mode === 'development') {
        plugins.push(new NodemonPlugin({
            watch : './**/*',
            script: __dirname + '/app.js'
        }));
    }

    return plugins;
}

module.exports = (mode, argv) => {
    const config = {
        entry: {
            app: [__dirname + '/client/src/js/app.js', __dirname + '/client/src/scss/app.scss']
        },
        output: {
            filename: 'js/[name].js',
            path    : path.resolve(__dirname, 'client/dist')
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use : [
                        MiniCssExtractPlugin.loader,
                        { loader: 'css-loader', options: { url: false, sourceMap: argv.mode === 'development' } },
                        { loader: 'sass-loader', options: { sourceMap: argv.mode === 'development' } }
                    ]
                },
                {
                    test   : /\.js$/,
                    exclude: /node_modules/,
                    use    : {
                        loader: 'babel-loader'
                    }
                }
            ]
        },
        plugins: getPlugins(argv.mode)
    };

    if (argv.mode === 'development') {
        config.devtool = 'source-map';
    }

    return config;
};