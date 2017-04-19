//npm install gulp-typescript typescript
var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('./src/tsconfig.json');

var dest = "SiteExtension/funcgraph";

gulp.task('build', function() {
    gulp.start("tsc");
    gulp.start("copyFiles");
});

gulp.task('tsc', function() {
    var tsResult = gulp.src("src/**/*.ts") // or tsProject.src() 
        .pipe(tsProject());
 
    return tsResult.js.pipe(gulp.dest(dest));
});

gulp.task('copyFiles', function(){
    return gulp.src("src/package.json").pipe(gulp.dest(dest));
})