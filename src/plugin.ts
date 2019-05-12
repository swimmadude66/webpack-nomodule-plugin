import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as minimatch from 'minimatch';

export interface NoModuleConfig {
    filePatterns: string[];
    // in case I want to add other optional configs later without breaking old uses
}

export class WebpackNoModulePlugin {

    constructor(private _config: NoModuleConfig = {filePatterns: []}) {

    }

    apply(compiler) {
        if (compiler.hooks) {
            // webpack 4 support
            compiler.hooks.compilation.tap('NoModulePlugin', (compilation) => {
                if (compilation.hooks.htmlWebpackPluginAlterAssetTags) {
                    // html webpack 3
                    compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
                        'NoModulePlugin',
                        (data, cb) => {
                            data.head = this._transformAssets(data.head);
                            data.body = this._transformAssets(data.body);
                            return cb(null, data);
                        }
                    )
                } else if (HtmlWebpackPlugin && HtmlWebpackPlugin.getHooks) {
                    // html-webpack 4
                    const hooks = HtmlWebpackPlugin.getHooks(compilation);
                    hooks.alterAssetTags.tapAsync(
                        'NoModulePlugin',
                        (data, cb) => {
                            data.assetTags.scripts = this._transformAssets(data.assetTags.scripts);
                            data.assetTags.styles = this._transformAssets(data.assetTags.styles);
                            data.assetTags.meta = this._transformAssets(data.assetTags.meta);
                            return cb(null, data);
                        }
                    )
                } else {
                    throw new Error('Cannot find appropriate compilation hook');
                }
            });
        } else {
            // Hook into the html-webpack-plugin processing
            compiler.plugin('compilation', function (compilation) {
                compilation.plugin('html-webpack-plugin-alter-asset-tags', (htmlPluginData, callback) => {
                    htmlPluginData.head = this._transformAssets(htmlPluginData.head);
                    htmlPluginData.body = this._transformAssets(htmlPluginData.body);
                    return callback(null, htmlPluginData);
                });
            });
        }
    }

    private _transformAssets(assets: any[]): any[]  {
        return assets.map(s => {
            if (s.tagName && s.tagName === 'script' && s.attributes && s.attributes.src) {
                const nomodule = this._config.filePatterns.some(pattern => minimatch(s.attributes.src, pattern));
                if (nomodule) {
                    s.attributes.nomodule = true;
                }
            }
            return s;
        });
    }
}