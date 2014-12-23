
var gulp = require('gulp'),
  less = require('gulp-less'),
  concat = require('gulp-concat'),
  path = require('path');


var paths = {
  js: {
    vendor: [
      './public/js/tools/vkbeautify.0.99.00.beta.js',
      './public/js/tools/select2.js',
      './public/js/tools/beautify.js',
      './public/js/blockly/blockly_compressed.js',
      './public/js/blockly/blocks_compressed.js',
      './public/js/blockly/javascript_compressed.js',
      './public/js/blockly/msg/en.js',
      './public/js/tools/jsoneditor.min.js'
    ],

    user: [
      // './public/js/test.js',
      './public/js/blocks.js',
      './public/js/blocks/**/*js',
      './public/js/block_gen.js',
      './public/js/utils.js',
      './public/js/app.js',
      './public/js/services/**/*js',
      './public/js/ctrls/**/*js',
      './public/js/blocks_defaults.js',
    ]

  }


};

gulp.task('js-user', function(){
  gulp.src(paths.js.user)
    .pipe(concat('dist.js'))
    .pipe(gulp.dest('./public'))

});
gulp.task('js-vendor', function(){
  gulp.src(paths.js.vendor)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./public'))

});

gulp.task('less', function () {
  gulp.src('./public/less/**/*.less')
    .pipe(less({
      // paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function(){
  gulp.watch('./public/less/**/*.less', ['less']);
  gulp.watch(paths.js.user, ['js-user']);
});


gulp.task('default', ['less', 'js-vendor', 'js-user', 'watch']);
