var path = require('path');
var webpack = require('webpack');

module.exports = {
	devtool: 'eval',
	entry: [
		'./src/devpanel.js'
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	plugins: [
		new webpack.NoErrorsPlugin()
	],
	resolve: {
		alias: {
			'redux-devtools': path.join(__dirname, '..'),
			'react': path.join(__dirname, 'node_modules', 'react')
		},
		extensions: ['', '.js']
	},
	module: {
		loaders: [{
			test: /\.js$/,
			loaders: [ 'babel'],
			exclude: /node_modules/
		}, {
			test: /\.js$/,
			loaders: ['babel']
		}]
	}
};
