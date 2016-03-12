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
const nodeSass = require('node-sass');
const sassLoader = require('sass-loader');
const webpack = require('webpack');
const svgSprite = require('gulp-svg-sprite');
const cssnano = require('gulp-cssnano');
const svgmin = require('gulp-svgmin');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const jade = require('gulp-jade');
const jadeInheritance = require('gulp-jade-inheritance');
const uglify = require('gulp-uglify');
const useref = require('gulp-useref');



const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development'; // условия для того чтобы делать сборку для продакшена другой без лишних элементов



gulp.task('jade', function() {
	return gulp.src('app/jade/*.jade')
	.pipe(jadeInheritance({basedir: 'app/jade'}))
    .pipe(jade())
    .pipe(gulp.dest('build'))
});

gulp.task('scss', function () {
  return gulp.src('app/scss/main.scss')
  	.pipe(gulpif(isDevelopment, sourcemaps.init()))
    .pipe(scss().on('error', scss.logError))
    .on('error', notify.onError())
    .pipe(autoprefixer(['last 2 versions', '> 5%', 'Firefox ESR']))
    .pipe(remember('css'))
	.pipe(concat('all.min.css'))
	.pipe(cssnano())
    .pipe(gulpif(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('build/css'));
});
 
gulp.task('clean', function(){ //создаем таск для очишения папки build перед сборкой
	return del('build');
});

gulp.task('assets', function(){
	return gulp.src(['app/assets/**/*.*','app/fonts/**/*.*',], {since: gulp.lastRun('assets')})
	.pipe(newer('build'))
	.pipe(gulp.dest('build'));
});


gulp.task('sass:svg', function(){
	return gulp.src('app/scss/**/*.svg')
	.pipe(svgmin())
	.pipe(svgSprite({
		mode: {
			css: {
				dest: '',
				bust: '',
				sprite: 'sprite.svg',
				layout: 'vertical',
				dimension: true,

				render:      {
					scss : {
					dest: 'sprite.scss'
				}
			  }
			}
		}
	}))
	.pipe(debug({title: 'svg'}))
	.pipe(gulpif('*.scss', gulp.dest('app/scss/sprites'), gulp.dest('app/img/sprites')));
});

gulp.task('imagemin', () => {
	return gulp.src('app/img/**/*.*')
		.pipe(newer('build/images'))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('build/images'));
});

// Add concat all li

gulp.task('js', function() {
  return gulp.src([
  	'app/js/main.js'
  	])
  	.pipe(gulpif(isDevelopment, sourcemaps.init()))
    .pipe(remember('js'))
	.pipe(concat('main.js'))    // .pipe(uglify())
    .pipe(gulpif(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('build/js'));
});


gulp.task('js:libs', function() {
  return gulp.src('app/js/libs/**/*.js')
    .pipe(remember('js'))
    .pipe(gulpif(isDevelopment,uglify()))
    .pipe(gulp.dest('build/js/libs'));
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



gulp.task('build', gulp.series('clean','sass:svg','imagemin', gulp.parallel('scss', 'assets','jade'),'js','js:libs'));


gulp.task('watch', function(){
	gulp.watch('app/scss/**/*.*', gulp.series('scss'));
	gulp.watch('app/assets/**/*.*', gulp.series('assets'));
	gulp.watch('app/img/**/*.*', gulp.series('imagemin'));
	gulp.watch('app/jade/**/*.*', gulp.series('jade'));
	gulp.watch('app/js/**/*.*', gulp.series('js'));
	
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch','serve')));

