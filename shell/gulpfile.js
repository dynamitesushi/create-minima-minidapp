const gulp = require('gulp');
const zip = require('gulp-zip');
const cp = require('child_process');
const app = require('./package.json');

function buildApp() {
  return cp.exec('npm run build');
}

function zipApp(cb) {
  const { name, version } = app;

  gulp.src('build/**')
    .pipe(zip(`${name}_${version}.mds.zip`))
    .pipe(gulp.dest('minidapp'));

  cb();
}

exports.default = gulp.series(buildApp, zipApp);
