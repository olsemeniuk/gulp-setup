// gulp
const { src, dest, series, watch, parallel } = require("gulp");

// general purpose plugins
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");

/*
 * ==================
 * PUG START
 * ==================
 */
// plugins
const pug = require("gulp-pug");
// files
const pugFiles = ["app/*.pug"];
// tasks
function managePugFiles() {
  return src(pugFiles).pipe(pug()).pipe(dest("dist"));
}
/*
 * ==================
 * PUG END
 * ==================
 */

/*
 * ==================
 * STYLES START
 * ==================
 */
// plugins
const sass = require("gulp-sass")(require("sass"));
// files
const styleFiles = ["app/sass/styles.sass"];
// tasks
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
/*
 * ==================
 * STYLES END
 * ==================
 */

/*
 * ==================
 * JS START
 * ==================
 */
// plugins
const terser = require("gulp-terser");
// files
const jsFiles = ["app/js/script.js"];
// tasks
function manageJSFiles() {
  return src(jsFiles)
    .pipe(sourcemaps.init())
    .pipe(concat("script.min.js"))
    .pipe(terser())
    .pipe(sourcemaps.write("../maps"))
    .pipe(dest("dist/js"));
}
/*
 * ==================
 * JS END
 * ==================
 */

/*
 * ==================
 * IMAGES START
 * ==================
 */
// plugins
const gulpAvif = require("gulp-avif");
const newer = require("gulp-newer");
// files
const imagesFiles = ["app/images/**/*"];
const imagesDest = "dist/images";
// tasks
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

const manageImages = parallel(imagesToAvif, imagesToWebp, imagesImagemin);
/*
 * ==================
 * IMAGES END
 * ==================
 */

/*
 * ==================
 * FONTS START
 * ==================
 */
// plugins
const fonter = require("gulp-fonter");
// files
const fontsFiles = "app/fonts/**/*";
const fontsDest = "dist/fonts";
// tasks
function fontsToWoff() {
  return src(fontsFiles, { encoding: false, removeBOM: false })
    .pipe(fonter({ formats: ["woff", "ttf"] }))
    .pipe(dest(fontsDest));
}

async function fontsToWoff2() {
  const ttf2woff2 = (await import("gulp-ttf2woff2")).default;
  return src(`${fontsDest}/**/*.ttf`, { encoding: false, removeBOM: false })
    .pipe(ttf2woff2())
    .pipe(dest(fontsDest));
}

const manageFonts = series(fontsToWoff, fontsToWoff2);
/*
 * ==================
 * FONTS END
 * ==================
 */

/*
 * ==================
 * WATCHING START
 * ==================
 */
// plugins
const browserSync = require("browser-sync").create();
// tasks
function watching() {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });

  watch(pugFiles, managePugFiles);
  watch(styleFiles, manageStyleFiles);
  watch(jsFiles, manageJSFiles);
  watch(fontsFiles, manageFonts);
  watch(imagesFiles, manageImages);
  watch("dist/**/*").on("change", browserSync.reload);
}
/*
 * ==================
 * WATCHING END
 * ==================
 */

// clean dist folder
async function cleanDist() {
  const { deleteAsync } = await import("del");
  return deleteAsync(["dist/**/*", "!dist/.gitkeep"]);
}

// exports
exports.clean = cleanDist;
exports.build = series(
  cleanDist,
  managePugFiles,
  manageStyleFiles,
  manageJSFiles,
  manageFonts,
  manageImages
);
exports.default = series(
  cleanDist,
  managePugFiles,
  manageStyleFiles,
  manageJSFiles,
  manageFonts,
  manageImages,
  watching
);
