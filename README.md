# Html Webpack Nomodule Plugin
_Assigns the nodmodule attribute to script tags injected by [Html Webpack Plugin](https://github.com/jantimon/html-webpack-plugin)_

## Configuration

1. Install via `npm i -D html-webpack-nomodule-plugin`
1. Add to your webpack config AFTER HtmlWebpackPlugin
```javascript
    var NoModulePlugin = require('html-webpack-nomodule-plugin').HtmlWebpackNoModulePlugin;
    // OR for import style
    import {HtmlWebpackNoModulePlugin} from 'html-webpack-nomodule-plugin'
    ...
    plugins: [
        new HtmlWebpackPlugin({
            filename: join(OUTPUT_DIR, './dist/index.html'),
            hash: false,
            inject: 'body',
            minify: minifyOptions,
            showErrors: false
            template: join(__dirname, './src/index.html'),
        }),
        new HtmlWebpackNoModulePlugin({
            filePatterns: ['polyfill.**.js']
        })
    ]
```

The plugin takes a configuration argument with a key called `filePatterns`. This is an array of file globs (provided via [minimatch](https://github.com/isaacs/minimatch)) representing which injected script tags to flag as nomodule. **Scripts with this attribute will not be executed on newer browsers, so IE and other browser polyfills can be skipped if not needed.**


## Testing
Testing is done via ts-node and mocha. Test files can be found in `/spec`, and will be auto-discovered as long as the file ends in `.spec.ts`. Just run `npm test` after installing to see the tests run.
