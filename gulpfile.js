// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleanCSS = require('gulp-clean-css'),
	//gutil = require('gulp-util'),
	rename = require('gulp-rename'),
	babel = require('gulp-babel');

// Lint Task
gulp.task('lint', function() {
	return gulp.src('assets/js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
	return gulp.src('assets/css/styles.scss')
		.pipe(sass())
		.pipe(gulp.dest('assets/css'))
		.pipe(rename('style.min.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest('assets/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
	return gulp
		.src([
			'assets/js/manage-layout.js',
			'assets/js/components.js'
		])
		.pipe( babel({
			only: ['assets/js/components.js'],
			presets: ['react', 'es2015'],
			compact:false
		}) )
		.pipe(concat('all.js'))
		.pipe(gulp.dest('assets/js'))
		.pipe(rename('all.min.js'))
		.pipe(uglify())
		//.pipe(uglify().on('error', gutil.log))
		.pipe(gulp.dest('assets/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
	//gulp.watch('js/theme/*.js', ['lint', 'scripts']);
	gulp.watch('assets/js/scripts.js', ['scripts']);
	gulp.watch('assets/js/components.js', ['scripts']);
	gulp.watch('assets/css/partials/*.scss', ['sass']);
	gulp.watch('assets/css/styles.scss', ['sass']);
});

// Default Task
//gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);
gulp.task('default', ['sass', 'scripts', 'watch']);


/*
JavaScript module tree, to show dependencies.

- AE.js
	- AE.account.js
	- AE.booking.js
		- AE.booking.savequote.js
		- AE.booking.terms.js
		- AE.booking.matrix.js
			- AE.booking.matrix.results.js
		- AE.booking.optequip.js
	- AE.cookie.js
	- AE.forms.js
	- AE.ga.js
	- AE.init.js
	- AE.legacy.js
	- AE.maps.js
	- AE.mura.js
	- AE.nav.js
	- AE.newsletter.js
	- AE.template.js
	- AE.ui.js
		- AE.ui.datepicker.js
		- AE.ui.tabcordion.js
		- AE.ui.dialog.js
		- AE.ui.modify.js
		- AE.ui.autocomplete.js
		- AE.ui.selectmenu.js
	- AE.utils.js



=====================
Setting up Gulp
=====================


There are two files that will be version controlled for Gulp. They are: 
package.json	: A general description of this project. It must be present, but we can update as needed. 
gulpfile.js		: This file that you're reading! It has all the instructions for what Gulp is going to do for us.


To get started, Node must be installed. There's an installer on the official site.
https://nodejs.org/en/


Here's an excellent article that will walk you through setting up Gulp:
https://travismaynard.com/writing/getting-started-with-gulp


There's a "gotcha" in that article, however. The "gulp-jshint" plugin has a dependence of "jshint". So the big install 
command that Travis Maynard's article gives you needs to include "jshint" in front of "gulp-jshint". It also needs to 
include a way to minify the CSS since the gulp-uglify plugin only handles JavaScript. Here's the completed command: 

npm install jshint gulp-jshint gulp-sass gulp-concat gulp-uglify clean-css gulp-clean-css gulp-rename gulp-livereload --save-dev

Here's an explanation on why that is:
https://github.com/olefredrik/FoundationPress/issues/664



=====================
Watching Files: 
=====================
If you include the 'watch' task, then Gulp will keep running in the terminal. When a file in a watched folder gets 
saved, the 'watch' task will run. This will keep running until you enter Control+C to stop it. If you don't want to 
run it that way, then you could just type "gulp" when you want to update the files. We've defined a default task, so 
we don't have to name it. (Although we could enter "gulp default" if we want to.)



* Probably don't need this part, but just in case: *
=======================================================================================================================
I didn't have any permission problems, but if you do then this might help: 
https://docs.npmjs.com/getting-started/fixing-npm-permissions

But it also leaves something out. The video expects you to edit a text file in the terminal but doesn't say what 
keyboard commands were needed to get this done. Here's a reference for that: 
http://stackoverflow.com/questions/37365179/open-a-file-in-editor-and-then-save-it-back-by-terminal-on-bash



*/