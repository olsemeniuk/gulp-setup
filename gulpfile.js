// gulp
const { src, dest, series, watch, parallel } = require("gulp");

// plugins
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const pug = require("gulp-pug");
const terser = require("gulp-terser");
const browserSync = require("browser-sync").create();

// files
const styleFiles = ["app/sass/styles.sass"];
const pugFiles = ["app/*.pug"];
const jsFiles = ["app/js/script.js"];

// tasks
function managePugFiles() {
  return src(pugFiles).pipe(pug()).pipe(dest("dist"));
}

async function manageStyleFiles() {
  const autoprefixer = (await import("gulp-autoprefixer")).default;
  return src(styleFiles)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(concat("styles.min.css"))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write("../maps"))
    .pipe(dest("dist/css"));
}

function manageJSFiles() {
  return src(jsFiles)
    .pipe(sourcemaps.init())
    .pipe(concat("script.min.js"))
    .pipe(terser())
    .pipe(sourcemaps.write("../maps"))
    .pipe(dest("dist/js"));
}

function autoReload() {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });
}

function watching() {
  watch(pugFiles, managePugFiles);
  watch(styleFiles, manageStyleFiles);
  watch(jsFiles, manageJSFiles);
  watch("dist/**/*").on("change", browserSync.reload);
}

async function cleanDist() {
  const { deleteAsync } = await import("del");
  return deleteAsync(["dist/**/*"]);
}

exports.clean = cleanDist;
exports.build = series(cleanDist, managePugFiles, manageStyleFiles, manageJSFiles);
exports.default = series(
  cleanDist,
  managePugFiles,
  manageStyleFiles,
  manageJSFiles,
  parallel(watching, autoReload)
);
