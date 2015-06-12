var path = require("path");
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var	root = process.cwd();
var imgPath = path.join( root, "src/images/**/*" );
var imgDestPath = path.join( root, "images" );

module.exports.run = function(){

	gulp.src( imgPath )
	    .pipe(imagemin({
	        progressive: true,
	        svgoPlugins: [{removeViewBox: false}],
	        use: [pngquant()]
	    }))
	    .pipe(gulp.dest( imgDestPath ));

}