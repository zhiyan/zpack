var path = require("path");
var	pkg = require("../package.json");
var	compile = require("./compile.js");
var	util = require("./util");
var	root = process.cwd();
var	config = require( path.join(root,pkg.configFile) );

// compile type
var	type = "dev";

module.exports.run = function(){
	var exportsArr = config.exports || [],
		cssArr = [],
		jsArr = [];

	// expose css and js to different array
	exportsArr.forEach(function(v,i){
		if( util.isJS(v) ){
			jsArr.push( v );
		}else if( util.isCSS(v) ){
			cssArr.push( v );
		}
	});

	compile.clean( type );
	cssArr.length  && compile.compileCSS(cssArr, type);
	jsArr.length && compile.compileJS(jsArr, type);
}