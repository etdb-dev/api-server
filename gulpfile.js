const gulp = require('gulp');
const gutil = require('gulp-util');
const jshint = require('gulp-jshint');

const GulpForever = require('./.gulp/forever.js');
let forever = new GulpForever('.forever/etdb-api-dev.json');

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

// starts dev server in daemon mode
// @see .forever/etdb-api-dev.json
gulp.task('dev:start', function(done) {
  forever.isRunning('etdb-api-dev').then((instances) => {
    if (instances.length !== 0) {
      let pids = instances.map((instance) => instance.pid);
      gutil.log('Development server is already running. pid(s): ' + pids.join(', '));
    } else {
      forever.startDaemon('etdb-api-dev');
    }

    return done();
  });
});

// stops all instances of dev server
gulp.task('dev:stop', function(done) {
  forever.stop('etdb-api-dev').then((stopped) => {
    gutil.log(`${stopped.n} instance${stopped.n > 1 ? 's have' : ' has'} been stopped!`);
  });
});
gulp.task('dev:isRunning', function(done) {
  forever.isRunning('etdb-api-dev').then((instances) => gutil.log(instances));
});
gulp.task('dev:tail', function() {
  forever.tail('etdb-api-dev', (data) => {
    gutil.log(`[${gutil.colors.gray(data.file + '|' + data.pid)}] ${data.line}`);
  });
});

gulp.task('dev', [ 'dev:start', 'dev:tail' ], () => {
  gutil.log('Development Mode');
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
