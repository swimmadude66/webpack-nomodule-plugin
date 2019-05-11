import {join} from 'path';
import {readFileSync} from 'fs';
import {expect} from 'chai';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as rimraf from 'rimraf';
import {WebpackNoModulePlugin} from '../src/plugin';

const OUTPUT_DIR = join(__dirname, './test_dist');

const HtmlWebpackPluginOptions = {
    filename: 'index.html',
    hash: false,
    inject: 'body',
    minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,

    },
    showErrors: true,
    template: join(__dirname, './test_data/index.html'),
};

const webpackDevOptions: webpack.Configuration = {
    mode: 'development',
    entry: {
        app: join(__dirname, './test_data/entry.js'),
        polyfill: join(__dirname, './test_data/polyfill.js'),
    },
    output: {
        path: OUTPUT_DIR
    }
};

const webpackProdOptions: webpack.Configuration = {
    ...webpackDevOptions,
    output: {
        filename: '[name].[contenthash].min.js',
        path: OUTPUT_DIR,
        pathinfo: true
    },
    mode: 'production',
};

function getOutput(): string {
    const htmlFile = join(OUTPUT_DIR, './index.html');
    const htmlContents = readFileSync(htmlFile).toString('utf8');
    expect(!!htmlContents).to.be.true;
    return htmlContents;
}

describe('WebpackNoModulePlugin Development Mode', () => {

    afterEach((done) => {
        rimraf(OUTPUT_DIR, done);
    });

    it('should do nothing when no patterns are specified', function (done) {
        webpack({ ...webpackDevOptions,
            plugins: [
                new HtmlWebpackPlugin(HtmlWebpackPluginOptions),
                new WebpackNoModulePlugin(),
            ]
        }, (err) => {
            expect(!!err).to.be.false;
            const html = getOutput();
            expect(/script\s+.*?src\s*=\s*"(\/)?polyfill\.js"/i.test(html), 'could not find polyfill bundle').to.be.true;
            expect(/script\s+.*?src\s*=\s*"(\/)?app\.js"/i.test(html), 'could not find app bundle').to.be.true;
            done();
        });
    });

    it('should mark script as nomodule if the pattern matches', function (done) {
        webpack({ ...webpackDevOptions,
            plugins: [
                new HtmlWebpackPlugin(HtmlWebpackPluginOptions),
                new WebpackNoModulePlugin({
                    filePatterns: ['polyfill\.js']
                }),
            ]
        }, (err) => {
            expect(!!err).to.be.false;
            const html = getOutput();
            expect(/script\s+.*src\s*=\s*"(\/)?polyfill\.js"/i.test(html), 'could not find polyfill bundle').to.be.true;
            expect(/script\s+.*src\s*=\s*"(\/)?app\.js"/i.test(html), 'could not find app bundle').to.be.true;
            expect(/script\s+.*?src\s*=\s*"(\/)?polyfill\.js"\s+nomodule/i.test(html), 'attribute missing from polyfill bundle').to.be.true;
            expect(/script\s+.*?src\s*=\s*"(\/)?app\.js"\s+nomodule/i.test(html), 'attribute present on app bundle').to.be.false;
            done();
        });
    });
});


describe('WebpackNoModulePlugin Production Mode', () => {

    afterEach((done) => {
        rimraf(OUTPUT_DIR, done);
    });

    it('should do nothing when no patterns are specified', function (done) {
        webpack({ ...webpackProdOptions,
            plugins: [
                new HtmlWebpackPlugin(HtmlWebpackPluginOptions),
                new WebpackNoModulePlugin(),
            ]
        }, (err) => {
            expect(!!err).to.be.false;
            const html = getOutput();
            expect(/script\s+.*?src\s*=\s*"(\/)?polyfill\.[a-z0-9]+\.min\.js"/i.test(html), 'could not find polyfill bundle').to.be.true;
            expect(/script\s+.*?src\s*=\s*"(\/)?app\.[a-z0-9]+\.min\.js"/i.test(html), 'could not find app bundle').to.be.true;
            done();
        });
    });

    it('should mark script as nomodule if the pattern matches', function (done) {
        webpack({ ...webpackProdOptions,
            plugins: [
                new HtmlWebpackPlugin(HtmlWebpackPluginOptions),
                new WebpackNoModulePlugin({
                    filePatterns: ['polyfill.**.js']
                }),
            ]
        }, (err) => {
            expect(!!err).to.be.false;
            const html = getOutput();
            expect(/<\s*script\s+.*src\s*=\s*"(\/)?polyfill\.[a-z0-9]+\.min\.js"/i.test(html), 'could not find polyfill bundle').to.be.true;
            expect(/<\s*script\s+.*src\s*=\s*"(\/)?app\.[a-z0-9]+\.min\.js"/i.test(html), 'could not find app bundle').to.be.true;
            expect(/<\s*script\s+.*?src\s*=\s*"(\/)?polyfill\.[a-z0-9]+\.min\.js"\s+nomodule/i.test(html), 'attribute missing from polyfill bundle').to.be.true;
            expect(/<\s*script\s+.*?src\s*=\s*"(\/)?app\.[a-z0-9]+\.min\.js"\s+nomodule/i.test(html), 'attribute present on app bundle').to.be.false;
            done();
        });
    });
});
