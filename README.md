# Webpack Nomodule Plugin
_Assigns the `nomodule` attribute to script tags injected by [Html Webpack Plugin](https://github.com/jantimon/html-webpack-plugin)_

![build-plugin](https://github.com/swimmadude66/webpack-nomodule-plugin/workflows/build-plugin/badge.svg?branch=master)

[![NPM](https://nodei.co/npm/webpack-nomodule-plugin.png?compact=true)](https://npmjs.org/package/webpack-nomodule-plugin)
## Configuration

1. Install via `npm i -D webpack-nomodule-plugin`
1. Add to your webpack config AFTER HtmlWebpackPlugin
```javascript
    var NoModulePlugin = require('webpack-nomodule-plugin').WebpackNoModulePlugin;
    // OR for import style
    import {WebpackNoModulePlugin} from 'webpack-nomodule-plugin'
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
        new WebpackNoModulePlugin({
            filePatterns: ['polyfill.**.js']
        })
    ]
```

The plugin takes a configuration argument with a key called `filePatterns`. This is an array of file globs (provided via [minimatch](https://github.com/isaacs/minimatch)) representing which injected script tags to flag as nomodule. **Scripts with this attribute will not be executed on newer browsers, so IE and other browser polyfills can be skipped if not needed.**

### filePatterns
The match logic will attempt to match the `src` attribute that is added to the html against each glob in the `filePatterns` config. This means if your output js is not in the same folder as your output html, you will need to specify a glob which accounts for the path from `index.html` to the output file.

e.g. For a situation in which js files are output in `dist/js/<filename>.<chunk>.min.js` and the html is output at `dist/index.html`
```javascript
plugins: [
        new HtmlWebpackPlugin({
            filename: join(OUTPUT_DIR, './dist/index.html'),
            hash: false,
            inject: 'body',
            minify: minifyOptions,
            showErrors: false
            template: join(__dirname, './src/index.html'),
        }),
        new WebpackNoModulePlugin({
            filePatterns: ['js/polyfill.**.js']
            // OR filePatterns: ['**/polyfill.**.js'] if the path is not known
        })
    ]
```

## Testing
Testing is done via ts-node and mocha. Test files can be found in `/spec`, and will be auto-discovered as long as the file ends in `.spec.ts`. Just run `npm test` after installing to see the tests run.
