var through = require('through2');
var idsDeps = require('./id-dep-process');

module.exports = function (options) {
    return through.obj(function (file, enc, cb) {
        idsDeps(options, file, enc, cb, this);
    });
};
