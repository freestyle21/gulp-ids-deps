# gulp-ids-deps

>gulp-ids-deps is a plugin of gulp to add seajs modules ids and deps auto.

### Install

    npm install gulp-ids-deps

### Usage

    var iddeps = require('gulp-ids-deps');

    iddeps(mainId, options);

### Options

- base
- alias
- except: the modules that do not combine

### Example

    var iddeps = require('gulp-ids-deps');

    // 给seajs模块添加上id和deps
    gulp.task('iddeps', ['tpl2js'], function() {
        return gulp.src('./client/dist/**/*')
            .pipe(iddeps({
                isMinify: false, // 是否压缩
                no_deps: ['seajs-text', mockjax, 'datetimepicker'],
                base: path.resolve(process.cwd(), "./client/dist/"), // 文件名带有这些的不处理
                alias: {
                  "$": "jquery/jquery/1.10.1/jquery.js",
                  "widget": "arale/widget/widget.js",
                  "base": "arale/base/base.js",
                  "events": "arale/events/events.js",
                  "class": "arale/class/class.js",
                  "templatable": "arale/templatable/templatable.js",
                  "overlay": "arale/overlay/overlay.js"
                }
            }));
    });

about more knowledge about seajs modules and Naming Conventions, visit [seajs docs](http://seajs.org/docs/#docs)
