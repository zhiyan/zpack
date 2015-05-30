var express = require("express");
var app = express();
var pkg = require("../package.json");
var root = process.cwd();
var fs = require("fs-extra");
var path = require("path");
var compile = require("./compile");


module.exports.run = function(){

	app.listen("80", "static.rong360.com",function(){
		console.log("Server startup...");
	});

	app.use(function (req, res) {
		var origPath = req.path,
			target = {};
		target.path = origPath.replace("/prd/","/src/")
							 .replace(/@.*-.*(\.\w+)$/,"$1");

		console.log("Request: " + origPath);
		console.log("Get: " + target.path);
		target.path = path.join(root,target.path);
		target.ext = path.extname(target.path).substring(1);
		if( ["js","css"].indexOf( target.ext ) > -1 ){
			target.tag =origPath.match(/@([^\\\/-]+)/)[1];
			// if( fs.existsSync( targetPath )){
				compile.compileServer(target, res);
			// }else{
		  		// res.send( "Not found the file" );
			// }
		} 
	});
}