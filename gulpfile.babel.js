'use strict';

import autoprefixer from 'autoprefixer';
import browserSync from "browser-sync";
import cssnano from 'cssnano';
import del from 'del';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import info from "./package.json";
import named from 'vinyl-named';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';
import webpack from 'webpack-stream';
import wpPot from "gulp-wp-pot";
import yargs from 'yargs';
import zip from "gulp-zip";

const PRODUCTION = yargs.argv.prod;
const SERVER = browserSync.create();

function styles() {
  let plugins = [autoprefixer(), cssnano()];

  return gulp.src('src/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(PRODUCTION, postcss(plugins)))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulpif(!PRODUCTION,SERVER.stream()));
}

function images() {
  return gulp.src('src/img/**/*.{jpg,jpeg,png,svg,gif}')
    .pipe(gulpif(PRODUCTION, imagemin()))
    .pipe(gulp.dest('dist/img'));
}

function fonts() {
  let options = {clone: true}
  return gulp.src('src/fonts/**/*.ttf')
    .pipe(gulpif(PRODUCTION, ttf2woff(options)))
    .pipe(gulpif(PRODUCTION, ttf2woff2(options)))
    .pipe(gulp.dest('dist/fonts'));
}

function copy() {
  return gulp.src(['src/**/*','!src/{img,js,scss,fonts}','!src/{img,js,scss,fonts}/**/*'])
    .pipe(gulp.dest('dist'));
}

function clean() {
  return del(['dist']);
}

function scripts() {
  return gulp.src('src/js/*.js')
  .pipe(named())
  .pipe(webpack({
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    mode: PRODUCTION ? 'production' : 'development',
    devtool: 'source-map',
    output: {
      filename: '[name].js'
    },
    externals: {
      jquery: 'jQuery'
    },
  }))
  .pipe(gulp.dest('dist/js'));
}

function compress() {
  return gulp.src([
  "**/*",
  "!node_modules{,/**}",
  "!bundled{,/**}",
  "!src{,/**}",
  "!.babelrc",
  "!.gitignore",
  "!gulpfile.babel.js",
  "!package.json",
  "!package-lock.json",
  ])
  .pipe(zip(`${info.name}.zip`))
  .pipe(gulp.dest('bundled'));
}

function pot() {
  return gulp.src("**/*.php")
  .pipe(
      wpPot({
        domain: "wpbase",
        package: info.name
      })
    )
  .pipe(gulp.dest(`languages/${info.name}.pot`));
}

function serve(done) {
  SERVER.init({
    proxy: "http://wp-test.local" // put your local website link here
  });
  done();
}

function reload(done) {
  SERVER.reload();
  done();
}

function watch() {
  gulp.watch('src/scss/**/*.scss', styles);
  gulp.watch('src/img/**/*.{jpg,jpeg,png,svg,gif}', gulp.series(images, reload));
  gulp.watch('src/fonts/**/*.ttf', fonts);
  gulp.watch(['src/**/*','!src/{img,js,scss,fonts}','!src/{img,js,scss,fonts}/**/*'], gulp.series(copy, reload));
  gulp.watch('src/js/**/*.js', gulp.series(scripts, reload));
  gulp.watch("**/*.php", reload);
}

export const dev = gulp.series(clean, gulp.parallel(styles, images, fonts, copy, scripts), serve, watch);
export const build = gulp.series(clean, gulp.parallel(styles, images, fonts, copy, scripts), pot, compress)
export default dev;
