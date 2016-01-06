'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('transform', function() {
    return gulp.src('./src/FormatNumber.js')
        .pipe(babel({presets: ['react','es2015']}))
        .pipe(gulp.dest('demo'));
});

gulp.task('dev', ['transform'], function() {

    var webserver = require('gulp-webserver');
    gulp.src('demo/')
        .pipe(webserver({
            host: '0.0.0.0',
            port: 8080,
            livereload: true,
            directoryListing: false,
            fallback: 'index.html'
        }));
});

gulp.task('transform-dist', function() {
    return gulp.src('./src/FormatNumber.js')
        .pipe(babel({presets: ['react','es2015']}))
        .pipe(gulp.dest('dist'));
});

gulp.task('dist', ['transform-dist'], function() {
    var uglify = require('gulp-uglify');
    var rename = require('gulp-rename');

    gulp.src('./dist/FormatNumber.js')
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('./dist/'));
});
