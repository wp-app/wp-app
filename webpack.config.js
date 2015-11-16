var path = require('path'),
  webpack = require("webpack"),
  libPath = path.join(__dirname, 'lib'),
  wwwPath = path.join(__dirname, 'www'),
  pkg = require('./package.json'),
  HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(libPath, 'index.js'),
  output: {
    path: path.join(wwwPath),
    filename: 'bundle-[hash:6].js'
  },
  externals: {
    'pouchdb': 'PouchDB'
  },
  module: {
    postLoaders: [{
      test: /\.js$/, // include .js files
      exclude: /node_modules|dependencies/, // exclude any and all files in the node_modules folder
      loader: "jshint-loader"
    }],
    loaders: [{
      test: /[\/]moment\.js$/,
      loader: 'expose?moment'
    }, {
      test: /[\/]imgcache\.js$/,
      loader: 'expose?ImgCache'
    }, {
      test: /[\/]lodash\.js$/,
      loader: 'expose?_'
    }, {
      test: /\.json$/,
      loader: "json-loader"
    }, {
      test: /\.html$/,
      loader: 'html'
    }, {
      test: /\.(png|jpg)$/,
      loader: 'file?name=img/[name].[ext]' // inline base64 URLs for <=10kb images, direct URLs for the rest
    }, {
      test: /\.css$/,
      loader: "style!css"
    }, {
      test: /\.scss$/,
      loader: "style!css!autoprefixer!sass"
    }, {
      test: /\.js$/,
      exclude: /(node_modules)/,
      loader: "ng-annotate?add=true!babel"
    }, {
      test: [/ionicons\.svg/, /ionicons\.eot/, /ionicons\.ttf/, /ionicons\.woff/, /RobotoSlab-Regular\.ttf/, /RobotoSlab-Bold\.ttf/],
      loader: 'file?name=fonts/[name].[ext]'
    }, {
     test: /[\/]pouchdb\.js$/,
     loader: 'expose? PouchDB'
   }]
  },
  jshint: {
    // any jshint option http://www.jshint.com/docs/options/
    camelcase: true,
    emitErrors: false,
    globalstrict: true,
    failOnHint: false,
    predef: ['angular', 'moment', '_', 'ionic', 'kendo', 'document', 'window', 'navigator', 'cordova', 'gapi', 'localStorage', 'console']
  },
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
      IS_PROD: false
    })
  ]
};

function getRegexAutorizedLanguages() {
  return new RegExp(Object.keys(['en', 'nl']).join('|'));
}
