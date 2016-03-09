'use strict';

const gulp = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const del = require('del');
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');
const remember = require('gulp-remember');
const path = require('path');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');


const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development'; // условия для того чтобы делать сборку для продакшена другой без лишних элементов

gulp.task('scss', function () {
  return gulp.src('app/scss/main.scss')
  	.pipe(gulpif(isDevelopment, sourcemaps.init()))
    .pipe(scss().on('error', scss.logError))
    .on('error', notify.onError())
    .pipe(gulpif(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('build/css'));
});
 
gulp.task('clean', function(){ //создаем таск для очишения папки build перед сборкой
	return del('build');
});

gulp.task('assets', function(){
	return gulp.src('app/assets/**', {since: gulp.lastRun('assets')})
	.pipe(newer('build'))
	.pipe(gulp.dest('build'));
});

gulp.task('pretty', function () {
	return gulp.src('build/css/**/*.css', {since: gulp.lastRun('pretty')})
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(remember('css'))
		.pipe(concat('all.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build/css'));
});

// gulp.task('watcher', function () {  //функция для отслеживания изменения в css файлах и для того чтобы удалять файлы
// 	gulp.watch('build/css/**/*.css', gulp.series('pretty')).on('unlink', function(filepath) {
// 		remember.forget('css', path.resolve(filepath));
// 	});
// }); 

gulp.task('serve', function(){

	browserSync.init({
		server: 'build'
	});

	browserSync.watch('build/**/*.*').on('change',browserSync.reload);
});



gulp.task('build', gulp.series('clean', gulp.parallel('scss', 'assets'), 'pretty'));


gulp.task('watch', function(){
	gulp.watch('app/scss/**/*.*', gulp.series('scss'));
	gulp.watch('app/assets/**/*.*', gulp.series('assets'));
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch','serve')));

