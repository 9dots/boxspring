var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var webpack = require('webpack')
var path = require('path')
var net = require('net')
var fs = require('fs')
var WebpackDevServer = require('webpack-dev-server')

const folders = fs.readdirSync(path.resolve(__dirname, 'lib'))
  .reduce((cur, next) => (
    Object.assign(
      {},
      cur,
      {[next]: path.resolve(__dirname, `lib/${next}/`)}
    )
  ), {})

function config (env) {
  return {
    entry: {
      main: [
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './lib/client/index.js'
      ],
    },
    output: {
      filename: '[hash].[name].js',
      path: path.resolve(__dirname, 'public'),
      publicPath: '/public/'
    },
    resolve: {
      alias: folders
    },
    module: {
      loaders: [
        {
          test: /.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
	        test: /\.css$/,
	        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
	      }
      ]
    },
    target: 'web',
    plugins: [
			new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['manifest'] // Specify the common bundle's name.
      }),
      new HtmlWebpackPlugin({
		    title: 'Box Spring',
		    template: 'my-index.html' // Load a custom template (ejs by default see the FAQ for details)
		  })
    ],
    node: {
      module: 'empty',
      console: 'mock'
    },
    externals: {
      net: net,
      fs: fs
    },
		devtool: 'eval-source-map'
  }
}

var myServer = new WebpackDevServer(webpack(config()), {
  host: 'localhost',
  hot: true,
  inline: true,
  contentBase: 'public',
  historyApiFallback: {
    rewrites: [{
      from: /([\d\w\-\.]*)(\.js$|\.json$)/,
      to: context => '/' + context.match[0]
    }, {
      from: /([\d\w]*\.)([\d\w]*\.)([\d\w\-]*)(\.js$|\.json$)/,
      to: context => '/' + console.log('here\n\n\n', context)
    }],
    index: '/index.html'
  }
}).listen(8080)

module.exports = config
