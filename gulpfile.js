var gulp = require("gulp");
var browserSync = require("browser-sync").create();

gulp.task("default", function () {
  return browserSync.init({
    server: {
      baseDir: "./",
    },
    watchOptions: {
      ignoreInitial: true,
      ignored: "node_modules/*",
    },
    ui: false,
    online: true,
    notify: false,
    files: ["*.html", "*.css", "*.js"],
  });
});
