const HtmlWebPackPlugin = require( 'html-webpack-plugin' );
const webpack = require( 'webpack' );
const path = require( 'path' );

module.exports = {
   context: __dirname,
   entry: './src/index.tsx',
   output: {
      path: path.resolve( __dirname, 'dist' ),
      filename: 'main.js',
      publicPath: '/',
   },
   devServer: {
      historyApiFallback: true
   },
   module: {
      rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        {
            test: /\.js$/,
            use: 'babel-loader',
        },
        {
            test: /\.s[ac]ss$/i,
            use: [
              // Creates `style` nodes from JS strings
              "style-loader",
              // Translates CSS into CommonJS
              "css-loader",
              // Compiles Sass to CSS
              "sass-loader",
            ],
        },
        {
            test: /\.css$/,
            use: [
                "style-loader",
                { loader: "css-loader", options: { importLoaders: 1 } },
                "postcss-loader",
            ],
        },
        {
            test: /\.svg$/,
            use: ['@svgr/webpack', 'url-loader'],
        },
        {
            test: /\.(png|jpg|gif)$/,
            use: [
              {
                loader: 'file-loader',
              },
            ],
        },
        ]
    },
    resolve: {
        modules: [path.resolve(__dirname, './src'), 'node_modules'],
        extensions: [ '.tsx', '.ts', '.js' ],
        fallback: {
            https: require.resolve("https-browserify"),
            http: require.resolve("stream-http"),
            fs: false,
            child_process: false,
            net: require.resolve("net"),
            process: require.resolve("process")
        }
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: path.resolve( __dirname, 'public/index.html' ),
            filename: 'index.html'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],
    externals: {
        'crypto': 'crypto'
    }
};
