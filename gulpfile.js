'use strict';

var plugins = require('gulp-load-plugins');
var yargs = require('yargs');
var browser = require('browser-sync');
var gulp = require('gulp');
var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var fontBlast = require('font-blast');
var cp = require('child_process');

// Load all Gulp plugins into one variable
var $ = plugins();

// Check for --production flag
var PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
// const { COMPATIBILITY, PORT, PROXY, PATHS } = loadConfig();
var config = loadConfig();
var COMPATIBILITY = config.COMPATIBILITY;
var PORT = config.PORT;
var PROXY = config.PROXY;
var PATHS = config.PATHS;

function loadConfig() {
    var ymlFile = fs.readFileSync('_config.yml', 'utf8');
    return yaml.load(ymlFile);
}

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
    gulp.series(gulp.parallel(sass, javascript, svg)));

// Build the site, run the server, and watch for file changes
gulp.task('default',
    gulp.series('build', jekyllbuild, server, watch));

// Watch for file changes w/out browser started.
gulp.task('watch', watch);

// Combine & minify all SVGs into SVG sprite.
gulp.task('svg', svg);

// Generate FontAwesome icons as SVGs.
gulp.task('fa', fontAwesome);

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
// Message that appears in Browser Sync popup.
var messages = {
    jekyllBuild: 'Building Jekyll'
};

// Build the Jekyll Site
gulp.task('jekyll-build', jekyllbuild );

// Run command jekyll build
function jekyllbuild(done){
    // Popup the message for browser sync that jekyll is building.
    browser.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
    return gulp.src('assets/_scss/app.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: PATHS.sass
        })
            .on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: COMPATIBILITY
        }))
        // Comment in the pipe below to run UnCSS in production
        .pipe($.if(PRODUCTION, $.cssnano({
            autoprefixer: { browsers: COMPATIBILITY, add: true }
        })))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest('assets/css'))
        .pipe(browser.stream());
}

// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
    return gulp.src(PATHS.javascript)
        .pipe($.sourcemaps.init())
        .pipe($.babel({ignore: ['what-input.js','pikaday.js','pikaday-package.js','moment.js']}))
        .pipe($.concat('app.js'))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', function(e) { console.log(e) })))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest('assets/js'));
}

// Convert folder of individual SVGs into an SVG sprite.
function svg() {
    return gulp
        .src('assets/_svg/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore({ inlineSvg: true }))
        .pipe(gulp.dest('_includes/svg'));
}

/*
 * Generates all SVGs from the FontAwesome font.
 * Modified from this example:
 * https://github.com/eugene1g/font-blast-examples/blob/master/popular-fonts.js#L49
 *
 * Download the new font file adn icons.yml for a new version of FontAwesome:
 * - fontawesome-webfont.svg from: https://github.com/FortAwesome/Font-Awesome/tree/master/fonts
 * - icons.yml from: https://github.com/FortAwesome/Font-Awesome/tree/master/src
 */
function fontAwesome(done) {
    var ymlFile = fs.readFileSync('assets/_font-awesome/icons.yml', 'utf8');
    var iconNamingConventions = yaml.load(ymlFile).icons;

    var convertFilenames = {};
    iconNamingConventions.forEach(function (icon) {
        convertFilenames[icon.unicode] = icon.id;
    });

    fontBlast('assets/_font-awesome/fontawesome-webfont.svg', 'assets/_font-awesome', {
        filenames: convertFilenames
    });
    done();
}

// Start a server with browser to preview the site in
function server(done) {
    browser.init({
        server: {
            baseDir: '_site'
        }
    });
    done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
    gulp.watch('assets/_scss/**/*.scss').on('all', gulp.series(sass, jekyllbuild));
    gulp.watch('assets/_svg/*.svg').on('all', gulp.series(svg, jekyllbuild));
    gulp.watch('assets/_js/**/*.js').on('all', gulp.series(javascript, jekyllbuild));
    gulp.watch(['*.html', '*.md', '_layouts/*.html', '_posts/*', '_includes/**/*.html']).on('all', gulp.series(jekyllbuild));
    gulp.watch('_site/*').on('all', gulp.series(browser.reload));
}