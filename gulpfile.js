// Gulp
const { task, src, dest, series, parallel, watch } = require('gulp');

// Plugins
const args = require('yargs').argv;
const browserSync = require('browser-sync').create();
const cssnano = require('gulp-cssnano');
const gulpif = require('gulp-if');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

// Enviroment
const isDevelopment = args.env === 'development';

/* Styles
   ========================================================================== */

task('styles:bundle', () => {
	return src('./scss/*.scss')
		.pipe(
			sass({
				includePaths: ['node_modules', 'src', '.'],
				precision: 6
			}).on('error', sass.logError) // Log errors instead of killing the process))
		)
		.pipe(dest('./app/css/'))
		.pipe(browserSync.stream());
});

// Minify scripts in place
task('styles:minify', () => {
	return src('./app/css/**/*.css')
		.pipe(gulpif(isDevelopment, sourcemaps.init())) // Note that sourcemaps need to be initialized with libsass
		.pipe(
			cssnano({
				preset: 'default',
				autoprefixer: {
					add: true,
					browsers: ['Firefox >= 57']
				},
				mergeIdents: true,
				reduceIdents: true
			})
		)
		.pipe(gulpif(isDevelopment, sourcemaps.write('./')))
		.pipe(dest('./app/css/'));
});

task('styles', series('styles:bundle', 'styles:minify'));

/* Build
   ========================================================================== */

// Build a working copy of the project
if (isDevelopment) {
	// Development build
	task('build', parallel('styles:bundle'));
} else {
	// Production build
	task('build', parallel('styles'));
}

/* Watch
   ========================================================================== */

task('watch', () => {
	browserSync.init({
        server: './app/'
    });

	watch('./app/*.html').on('change', browserSync.reload);
	watch('./scss/**/*.scss', series('styles:bundle'));
});

/* Default
   ========================================================================== */

task('default', series('build', 'watch'));
