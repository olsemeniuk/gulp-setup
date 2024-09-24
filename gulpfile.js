// gulp
const { src, dest, series, watch, parallel } = require("gulp");

// plugins
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const pug = require("gulp-pug");
const terser = require("gulp-terser");
const browserSync = require("browser-sync").create();
const gulpAvif = require("gulp-avif");
const newer = require("gulp-newer");
const fonter = require("gulp-fonter");
// import ttf2woff2 from 'gulp-ttf2woff2';

// files
const styleFiles = ["app/sass/styles.sass"];
const pugFiles = ["app/*.pug"];
const jsFiles = ["app/js/script.js"];
const imagesFiles = ["app/images/**/*"];
const imagesDest = "dist/images";
const fontsFiles = 

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

function imagesToAvif() {
  return src([...imagesFiles, "!app/images/**/*.svg"], {
    base: "app/images",
    encoding: false,
  })
    .pipe(newer(imagesDest))
    .pipe(gulpAvif({ quality: 50 }))
    .pipe(dest(imagesDest));
}

async function imagesToWebp() {
  const webp = (await import("gulp-webp")).default;
  return src(imagesFiles, {
    base: "app/images",
    encoding: false,
  })
    .pipe(newer(imagesDest))
    .pipe(webp())
    .pipe(dest(imagesDest));
}

async function imagesImagemin() {
  const imagemin = (await import("gulp-imagemin")).default;
  return src(imagesFiles, {
    base: "app/images",
    encoding: false,
  })
    .pipe(newer(imagesDest))
    .pipe(imagemin())
    .pipe(dest(imagesDest));
}

function watching() {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });

  watch(pugFiles, managePugFiles);
  watch(styleFiles, manageStyleFiles);
  watch(jsFiles, manageJSFiles);
  watch(imagesFiles, parallel(imagesToAvif, imagesToWebp, imagesImagemin));
  watch("dist/**/*").on("change", browserSync.reload);
}

async function cleanDist() {
  const { deleteAsync } = await import("del");
  return deleteAsync(["dist/**/*"]);
}

// exports
exports.clean = cleanDist;
exports.build = series(
  cleanDist,
  managePugFiles,
  manageStyleFiles,
  manageJSFiles,
  parallel(imagesToAvif, imagesToWebp, imagesImagemin)
);
exports.default = series(
  cleanDist,
  managePugFiles,
  manageStyleFiles,
  manageJSFiles,
  parallel(imagesToAvif, imagesToWebp, imagesImagemin),
  watching
);
