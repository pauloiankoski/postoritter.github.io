var $, gulp, merge, fs, CONFIG, FOLDERS, DOMAIN, PATHS, WATCH

gulp = require('gulp')
merge = require('merge-stream')
fs = require('fs')
$ = require('gulp-load-plugins')({ pattern: '*' })

CONFIG = {
  production: !!$.util.env.production,
  watch: !!$.util.env.watch,
  bs: !!$.util.env.bs,
  noprefix: !!$.util.env.noprefix
}

FOLDERS = ['./']

// Here are defined relateve paths for source files, dest paths and maps
// Change them if you know what you are doing or just stick to folder structure convention
PATHS = {
  sass: 'assets/source/sass',
  css: 'assets/css',
  vendors: 'assets/source/vendors',
  jsSource: 'assets/source/js',
  jsDest: 'assets/js',
  maps: '../source/_maps'
}

// Here are defined default file paths to watch
// change them if you know what you are doing or just stick to folder structure convention
WATCH = {
  php: '/**/*.php',
  sass: PATHS.sass + '/**/*.scss',
  css: PATHS.css + '/**/*.css',
  jsSource: PATHS.jsSource + '/**/*.js',
  jsDest: PATHS.jsDest + '/**/*.js'
}

gulp.task('sass', function () {
  var tasks = FOLDERS.map(function (folder) {
    return gulp.src([ folder + PATHS.sass + '/*.scss', folder + PATHS.sass + '/frontend/*.scss', folder + PATHS.sass + '/admin/*.scss' ], { base: folder + PATHS.sass })
      .pipe($.plumber())
      .pipe($.sourcemaps.init({ largeFile: true }))
      .pipe($.sass().on('error', $.sass.logError))
      .pipe(!CONFIG.noprefix ? $.autoprefixer({ browsers: [ 'last 5 versions', '> 1%' ] }) : $.util.noop())
      .pipe(!CONFIG.production ? $.sourcemaps.write(PATHS.maps + '/css') : $.util.noop())
      .pipe($.cached('sass'))
      .pipe(gulp.dest(folder + PATHS.css))
      .pipe($.filter('**/*.css'))
      .pipe($.cleanCss())
      .pipe($.rename({ suffix: '.min' }))
      .pipe(!CONFIG.production ? $.sourcemaps.write(PATHS.maps + '/css') : $.util.noop())
      .pipe($.cached('sass'))
      .pipe(gulp.dest(folder + PATHS.css))
      .pipe($.size({ title: folder + ' css' }))
      .pipe($.browserSync.stream())
  })
  return merge(tasks)
})

gulp.task('css', function () {
  var tasks = FOLDERS.map(function (folder) {
    return gulp.src(folder + PATHS.vendors + '/**/*.css')
      .pipe($.plumber())
      .pipe(gulp.dest(folder + PATHS.css))
      .pipe($.filter('**/*.css'))
      .pipe($.cleanCss())
      .pipe($.rename({ suffix: '.min' }))
      .pipe(gulp.dest(folder + PATHS.css))
      .pipe($.size({ title: folder + ' css' }))
      .pipe($.browserSync.stream())
  })
  return merge(tasks)
})

gulp.task('js-libs', function () {
  var tasks = FOLDERS.map(function (folder) {
    return gulp.src(folder + PATHS.jsSource + '/libs/*.js')
      .pipe($.sourcemaps.init())
      .pipe($.concat('libs.js'))
      .pipe(gulp.dest(folder + PATHS.jsSource))
  })
  return merge(tasks)
})

gulp.task('js', function () {
  var tasks = FOLDERS.map(function (folder) {
    var jsFiles = '/*.js'
    return gulp.src(folder + PATHS.jsSource + jsFiles)
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.concat('app.js'))
      .pipe(!CONFIG.production ? $.sourcemaps.write(PATHS.maps + '/js') : $.util.noop())
      .pipe($.cached('js'))
      .pipe(gulp.dest(folder + PATHS.jsDest))
      .pipe($.filter('**/*.js'))
      .pipe($.rename({ suffix: '.min' }))
      .pipe($.uglify())
      .pipe(!CONFIG.production ? $.sourcemaps.write(PATHS.maps + '/js') : $.util.noop())
      .pipe($.cached('js'))
      .pipe(gulp.dest(folder + PATHS.jsDest))
      .pipe($.size({ title: folder + ' js' }))
      .pipe($.browserSync.stream())
  })
  return merge(tasks)
})

gulp.task('browser-sync', function () {
  $.browserSync.init({
    server: {
      baseDir: './'
    }
  })
})

gulp.task('development', function (done) {
  if (CONFIG.watch) {
    CONFIG.bs ? gulp.task('browser-sync')() : $.util.noop()
    gulp.watch(WATCH.sass, gulp.task('sass'))
    gulp.watch(WATCH.jsSource, gulp.task('js'))
  }

  done()
})

gulp.task('default', gulp.series(gulp.parallel('css', 'sass', gulp.series('js-libs', 'js')), 'development'))

// gulp.task( 'production', ['sass-production', 'js-production'] );
