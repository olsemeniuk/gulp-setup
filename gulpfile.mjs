// import gulp
import gulp from "gulp";
const {series, parallel, src, dest, watch} = gulp;

// import plugins
// sass
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);
// sourcemaps
import sourcemaps from "gulp-sourcemaps";
// files concatenation and rename
import concat from "gulp-concat";
// js minification
import terser from "gulp-terser";
// browser live reload
import browserSync from "browser-sync";
const gulpBrowserSync = browserSync.create();
// autoprefixer
import autoprefixer from "gulp-autoprefixer";
// delete files
import {deleteAsync} from "del";
// pug
import pug from "gulp-pug";
// images
import imagemin from "gulp-imagemin";

// paths
const paths = {
    pug: {
        src: "./app/*.pug",
        dest: "./dist/"
    },
    styles: {
        src: "./app/sass/main.sass",
        dest: "./dist/css/"
    },
    scripts: {
        src: "./app/js/**/*.js",
        dest: "./dist/js/"
    },
    images: {
        src: "./app/images/**/*",
        dest: "./dist/images/"
    }
};

// tasks
function clean() {
    return deleteAsync(["./dist/**/*"]);
}

function styles() {
    return src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: "compressed"}).on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(concat("style.min.css"))
        .pipe(sourcemaps.write("./"))
        .pipe(dest(paths.styles.dest))
        .pipe(gulpBrowserSync.stream());
}

function scripts() {
    return src(paths.scripts.src)
        .pipe(concat("main.min.js"))
        .pipe(sourcemaps.init())
        .pipe(terser())
        .pipe(sourcemaps.write("./"))
        .pipe(dest(paths.scripts.dest))
        .pipe(gulpBrowserSync.stream());
}

function html() {
    return src(paths.pug.src)
        .pipe(pug())
        .pipe(dest(paths.pug.dest))
        .pipe(gulpBrowserSync.stream());
}


function watching() {
    gulpBrowserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    watch(paths.styles.src, styles);
    watch(paths.scripts.src, scripts);
    watch(paths.pug.src, html);
}

export {clean}
export default series(clean, parallel(html, styles, scripts), watching);
