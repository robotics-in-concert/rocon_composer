var gulp = require('gulp'),
  less = require('gulp-less'),
  concat = require('gulp-concat'),
  path = require('path'),
  mainBowerFiles = require('main-bower-files'),
  removeUseStrict = require('gulp-remove-use-strict'),
  uglify  = require('gulp-uglify')
  replace = require('gulp-replace');


var paths = {
  js: {
    blockly: [
      './public/js/blockly/blockly_compressed.js',
      './public/js/blockly/blocks_compressed.js',
      './public/js/blockly/javascript_compressed.js',
      './public/js/blockly/msg/en.js',
    ],
    vendor: [
      './public/components/js/vendor/socket.min.js',
      './public/js/vendor/socket.min.js',
      './public/js/vendor/bootstrap-editable.min.js',
      './public/js/vendor/jsoneditor.min.js'
    ],

  }


};

gulp.task('js-blockly', function(){
  gulp.src(paths.js.blockly)
    .pipe(concat('blockly.js'))
    .pipe(gulp.dest('./public'))

});
gulp.task('css-vendor', function(){
  var bower_files = mainBowerFiles({
    filter: /.+\.css$/
  });
  gulp.src(bower_files)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./public'))


});

gulp.task('js-vendor', function(){
  var bower_files = mainBowerFiles({
    filter: /.+\.js$/
  });
  console.log(bower_files);

  // gulp.src(paths.js.vendor)
    // .pipe(concat('vendor.js'))
    // .pipe(gulp.dest('./public'))
  gulp.src(bower_files)
    .pipe(replace(/"use strict";?/g, ""))
    .pipe(concat('vendor.js'))
    .pipe(uglify())
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
