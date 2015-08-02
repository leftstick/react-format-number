'use strict';

var gulp = require('gulp');
var jsx = require('gulp-jsx');

gulp.task('transform', function() {
    return gulp.src('./src/FormatNumber.js')
        .pipe(jsx({factory: 'React.createElement'}))
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
