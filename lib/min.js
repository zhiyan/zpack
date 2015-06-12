var path = require("path");
var	compile = require("./compile.js");
var	util = require("./util");
var	config = util.readConfigFile();

// compile type
var	type = "prd";

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