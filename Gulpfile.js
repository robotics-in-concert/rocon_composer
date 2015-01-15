var gulp = require('gulp'),
  less = require('gulp-less'),
  concat = require('gulp-concat'),
  path = require('path');


var paths = {
  js: {
    vendor: [
      './public/js/blockly/blockly_compressed.js',
      './public/js/blockly/blocks_compressed.js',
      './public/js/blockly/javascript_compressed.js',
      './public/js/blockly/msg/en.js',
    ],

  }


};

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
});


gulp.task('default', ['less', 'js-vendor', 'watch']);
