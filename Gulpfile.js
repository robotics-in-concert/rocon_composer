
var gulp = require('gulp'),
  less = require('gulp-less'),
  path = require('path');


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


gulp.task('default', ['less', 'watch']);
