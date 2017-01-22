const gulp = require('gulp');
const gutil = require('gulp-util');
const jshint = require('gulp-jshint');

const forever = require('forever');

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

gulp.task('dev', function(done) {

  let foreverConf = require('./.forever/etdb-api-dev.json');
  gutil.log(foreverConf);
  forever.startDaemon('etdb.js', foreverConf);

  return gutil.log('Running in dev mode!');
});

gulp.task('deploy', function() {
  // NOTE: run tests on server
  // deploy on server
});

gulp.task('publish', function() {
  // NOTE: publish on github
});

gulp.task('run', function() {
  // NOTE: Use fork
  // fork('./etdb.js')
  return gutil.log('Running ETdb api server');
});

gulp.task('test', function() {
  return gutil.log('Running tests');
});
