var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var serve = require('gulp-serve');

gulp.task('minify', function () {
   gulp.src('./src/*.js')
      .pipe(uglify())
	  .pipe(rename('lunadiff.min.js'))
      .pipe(gulp.dest('./dist/'))
	  .pipe(gulp.dest('./examples/js'));
});

gulp.task('default', ['minify']);

gulp.task('serve', serve('./examples/'));