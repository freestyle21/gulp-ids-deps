
var gutil = require('gulp-util');
var colors = require('colors');
var path = require('path');
var fs = require('fs');
var uglifyJS = require("uglify-js");

var REQUIRSE_REG = /require\(([^)]+)\)/g;
var WORD_FROM_QUOTE = /\(\'(.*)\'\)|\(\"(.*)\"\)/;
var DEFINE_REG = /(define\()(function\(require,[\s]*exports(,[\s]*module)?\)[\s]*\{)/;

var process = {
    // param name, data, callback
    rewriteIdAndDeps: function(file, data, callback, config) {
        var ctx = this;
        // 非 .js 文件不处理
        if(path.extname(file) != '.js') {
            callback();
            return false;
        }
        // console.log('正在处理：' + file);
        var deps = [], id = '';
        var currentDir = path.dirname(file);

        id = '/' + this.getRelative(file, config.basePath);

        var depsRaw = data.match(REQUIRSE_REG);

        if(depsRaw && depsRaw.length && this.notInArr(config.no_deps, file)) {
            depsRaw.forEach(function(val, key) {
                var depsPath, depsFullPath;

                if(val.match(WORD_FROM_QUOTE)) {
                    depsPath = val.match(WORD_FROM_QUOTE)[1];
                } else {
                    return false;
                }
                // 在Alias Map中
                if(config.alias && config.alias[depsPath]) {
                    depsPath = config.alias[depsPath];
                }

                // 以.开头
                if(/^\./.test(depsPath)){
                    depsFullPath = path.resolve(currentDir, depsPath);
                    depsPath = '/' + ctx.getRelative(depsFullPath, config.basePath);
                }
                deps.push(depsPath);
            });
        }

        // 兼容  define(function(require, exports) {
        // 和  define(function(require, exports, module) {
        data = data.replace(DEFINE_REG, function(m, p1, p2, p3) {
            var result = p1 + '"' + id + '",';
            if(deps && deps.length) {
                result += ctx.arrToString(deps);
                result += ',';
            }
            return result + p2;
        });

        if(config.isMinify) {
            var result = uglifyJS.minify(data, {fromString: true});
            data = result.code;
        }
        fs.writeFile(file, data, {encoding: 'utf-8'}, function(err, code){
            if(err) {
                // console.log('处理失败: ' + file.red);
            }
            // console.log('处理完成: ' + file.magenta);
            callback();
        });
    },

    // arr ['seajs-text']
    // value /Users/qubaoming/nsky/seajs-text.js
    notInArr: function(arr, value) {
        var result = true;
        arr.forEach(function(val, key) {
            if(String(value).indexOf(val) != -1) {
                result = false;
            }
        });
        return result;
    },

    getRelative: function(src, basePath) {
        return path.relative(basePath, src).replace(/\.js$/, '');
    },

    // 数组 ['a','b','c'] 转换成 "['a','b','c']"
    arrToString: function(arr) {
        var str = '';
        if(!arr.length) {
            return str;
        }
        str += '[';
        arr.forEach(function(val, key) {
            str += '"' + val + '"';
            if(key != arr.length -1) {
                str += ',';
            }
        });
        str += ']';
        return str;
    }

};

module.exports = function(options, file, enc, cb, context) {
    var alias = options.alias || '';
    var basePath = options.base || '';
    var no_deps = options.no_deps || [];

    if (file.isNull()) {
        context.push(file);
        return cb();
    }

    if (file.isStream()) {
        context.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        return cb();
    }

    // var content = pp.preprocess(file.contents.toString(), options || {});
    // file.contents = new Buffer(content);

    context.push(file);

    process.rewriteIdAndDeps(file.path, file.contents.toString(), function() {
        // console.log('finish'.magenta);
    }, {
        basePath: basePath,
        no_deps,
        alias: alias,
        isMinify: options.isMinify || false
    });

    cb();
}
