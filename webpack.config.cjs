const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const configs = {
  entry: {
    basicApp: {
      import: __dirname+'/ui/scripts/index.js',
      filename: 'index.js',
    },
  },
  output: {
    path: path.resolve(__dirname, 'build/static'),
  },
  devServer: {
    port: 3002,
    host: 'localhost',
    open: true,
    allowedHosts: [
      'localhost',
    ],
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /[\/\\]node_modules[\/\\]some-module[\/\\]index\.js$/,
        loader: 'imports-loader',
        options: {
          imports: [
            'default jquery $',
          ],
        },
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: __dirname+'/ui/assets/images',
            },
          },
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.(js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(scss)$/,
        use: [{
          loader: 'style-loader', // inject CSS to page
        }, {
          loader: 'css-loader', // translates CSS into CommonJS modules
        }, {
          loader: 'postcss-loader', // Run post css actions
          options: {
            plugins: function() { // post css plugins,
              return [// can be exported to postcss.config.js
                require('precss'),
                require('autoprefixer'),
              ];
            },
          },
        }, {
          loader: 'sass-loader', // compiles Sass to CSS
        }],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname+'/ui/index.html',
    }),
  ],
};

// export default configs;
module.exports = configs;
