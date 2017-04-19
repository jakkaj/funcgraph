//npm install gulp-typescript typescript
//npm install gulp-sourcemaps
var gulp = require('gulp');
var typescript = require('gulp-tsc');
var fs = require("fs");
var dest = "SiteExtension/funcgraph";

gulp.task('build', function() {
    gulp.start("compile");
    gulp.start("copyFiles");
});


 
gulp.task('compile', function(){
var tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  gulp.src(['src/**/*.ts'])
    .pipe(typescript(tsconfig.compilerOptions))
    .pipe(gulp.dest(dest))
});

gulp.task('tsc', function() {
    var tsResult = gulp.src("src/**/*.ts") // or tsProject.src() 
        .pipe(sourcemaps.init())
        .pipe(tsProject());
 
    return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest));
});

gulp.task('copyFiles', function(){
    return gulp.src("package.json").pipe(gulp.dest(dest));
})