var path = require('path'),
    webpack = require("webpack"),
    libPath = path.join(__dirname, 'lib'),
    wwwPath = path.join(__dirname, 'www'),
    pkg = require('./package.json'),
    extend = require('util')._extend
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    webpackConfig = require('./webpack.config.js');

module.exports = extend(webpackConfig, {
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            pkg: pkg,
            template: path.join(libPath, 'index.html')
        }),
        new webpack.ContextReplacementPlugin(/moment\/locale$/, getRegexAutorizedLanguages()),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            IS_PROD: true
        }),
        new webpack.optimize.UglifyJsPlugin()
    ]
});

function getRegexAutorizedLanguages() {
    return new RegExp(Object.keys(['en', 'nl']).join('|'));
}
