//npm install gulp-typescript typescript
//npm install gulp-sourcemaps
var gulp = require('gulp');
var typescript = require('gulp-tsc');
var ava = require('gulp-ava');
var fs = require("fs");
var dest = "build/debug/SiteExtension/funcgraph";
var dest_test = "build/test";
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

gulp.task('test',["compile_tests"], function() {
    return gulp.src(dest_test + '/tests/tests.js')
    .pipe(ava({verbose: true}));
});

gulp.task('clean:test', function () {
  return del([
    dest_test + '/**/*'
  ]);
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
tsconfig.compilerOptions.outDir = dest;
  return gulp.src(['src/**/*.ts'])
    .pipe(typescript(tsconfig.compilerOptions))
    .pipe(gulp.dest(dest));
});

gulp.task('compile_tests',["clean:test"], function(){
var tsconfig = JSON.parse(fs.readFileSync('tests/tsconfig.json', 'utf8'));

tsconfig.compilerOptions.outDir = dest_test;

 return gulp.src(['tests/**/*.ts'])
    .pipe(typescript(tsconfig.compilerOptions))
    .pipe(gulp.dest(dest_test));
});


gulp.task('compile_release',["clean:release"], function(){


var tsconfig = JSON.parse(fs.readFileSync('src/tsconfig.json', 'utf8'));
tsconfig.compilerOptions.outDir = dest_rel;
tsconfig.compilerOptions.sourceMap = false;
  return gulp.src(['src/**/*.ts'])
    .pipe(typescript(tsconfig.compilerOptions))
    .pipe(gulp.dest(dest_rel));
});