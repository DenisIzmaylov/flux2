/* global require, module, __dirname */
var path = require('path');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: {
        'index': './index'
    },
    output: {
        path: path.join(__dirname, 'assets')
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {text: /\.jsx$/, loader: 'jsx-loader'}
        ]
    }
};