var gulp = require('gulp');
var browserSync = require('browser-sync');

// this task utilizes the browsersync plugin
// to create a dev server instance
// at http://localhost:9000
gulp.task('serve', function(done) {
  browserSync({
    online: false,
    open: false,
   // port: 9000,
      // host: '74.114.164.19',
    // // ui:false,
    host: 'localhost',
     port: 2095,
    
    server: {
      baseDir: ['.'],
      middleware: function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    }
  }, done);
});
