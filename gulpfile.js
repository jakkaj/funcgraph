//npm install gulp-typescript typescript
//npm install gulp-sourcemaps
var gulp = require('gulp');
var typescript = require('gulp-tsc');
var fs = require("fs");
var dest = "build/debug/SiteExtension/funcgraph";
var dest_rel = "build/release/SiteExtension/funcgraph";
var del = require('del');

gulp.task('build', function() {
    return [gulp.start("compile"),
    gulp.start("compile_tests"),
    gulp.src(["package.json", 'src/applicationHost.xdt', 'src/web.config'])
        .pipe(gulp.dest(dest))
    ];
});

gulp.task('build_release', function() {
    return [gulp.start("compile_release"),    
    gulp.src(["package.json", 'src/applicationHost.xdt', 'src/web.config'])
        .pipe(gulp.dest(dest_rel))
    ];
});

gulp.task('clean:release', function () {
  return del([
    dest_rel + '/**/*'
  ]);
});

gulp.task('clean:dev', function () {
  return del([
    dest + '/**/*'
  ]);
});
 
gulp.task('compile', function(){
var tsconfig = JSON.parse(fs.readFileSync('src/tsconfig.json', 'utf8'));
  gulp.src(['src/**/*.ts'])
    .pipe(typescript(tsconfig.compilerOptions))
    .pipe(gulp.dest(dest));
});

gulp.task('compile_tests', function(){
var tsconfig = JSON.parse(fs.readFileSync('src/tsconfig.json', 'utf8'));
  gulp.src(['tests/**/*.ts'])
    .pipe(typescript(tsconfig.compilerOptions))
    .pipe(gulp.dest(dest));
});


gulp.task('compile_release',["clean:release"], function(){


var tsconfig = JSON.parse(fs.readFileSync('src/tsconfig_release.json', 'utf8'));
  gulp.src(['src/**/*.ts'])
    .pipe(typescript(tsconfig.compilerOptions))
    .pipe(gulp.dest(dest_rel));
});