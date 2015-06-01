var path = require("path"),
	pkg = require("../package.json"),
	root = process.cwd(),
	config = require( path.join(root,pkg.configFile) ),
	compile = require("./compile.js"),
	util = require("./util"),
	type = "dev";

module.exports.run = function(){
	var exportsArr = config.exports || [],
		cssArr = [],
		jsArr = [];

	exportsArr.forEach(function(v,i){
		if( util.isJS(v) ){
			jsArr.push( v );
		}else if( util.isCSS(v) ){
			cssArr.push( v );
		}
	});

	compile.clean( type );
	cssArr.length  && compile.compileCSS(cssArr, type, true);
	jsArr.length && compile.compileJS(jsArr, type, true);
}