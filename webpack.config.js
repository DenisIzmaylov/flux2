/**
 * Build Bower scripts
 */
'use strict';
var webpack = require('webpack');
var path = require('path');

module.exports = {
    context: __dirname,
    entry: './index',
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'flux2.min.js',
        library: 'Flux2',
        libraryTarget: 'umd'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {text: /\.jsx$/, loader: 'jsx-loader'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};