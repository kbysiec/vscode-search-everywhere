const gulp = require("gulp");
const replacer = require("gulp-string-replacer");

function fixCoverageReportSrcPaths() {
  return gulp
    .src("./dist/coverage/coverage-final.json")
    .pipe(
      replacer([
        {
          regex: /(path\":)(.*)(?=src)/,
          replacement: `path":"`,
        },
      ])
    )
    .pipe(gulp.dest("./dist/coverage"));
}

gulp.task("fixCoverageReportSrcPaths", fixCoverageReportSrcPaths);
