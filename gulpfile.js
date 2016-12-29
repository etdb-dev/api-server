var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var exec = require('child_process').exec;

gulp.task('default', function() {
    return gutil.log('Help\n\nUse one of the following parameters:\n\n' +
            'watch - run the jslinter, when code has changed\n' +
            'run - just run the server\n' +
            'dev - run the server with linter in background\n' +
            'test - run server and tests\n');
});

gulp.task('jshint', function() {
    return gulp.src('./*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function() {
    gulp.watch('./*.js', ['jshint']);
});

gulp.task('dev', function() {
   return gutil.log('Running in dev mode!'); 
});

gulp.task('run', function() {
    exec('npm start', function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
    });
    
    return gutil.log('Running ETdb api server');
});

gulp.task('test', function() {
    return gutil.log('Running tests');
});
