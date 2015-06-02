var express = require("express");
var app = express();
var pkg = require("../package.json");
var root = process.cwd();
var fs = require("fs-extra");
var path = require("path");
var compile = require("./compile");


module.exports.run = function(){

	var contentType = {
		"js" : "application/javascript",
		"css" : "text/css",
		"html" : "text/html",
		"png" : "image/png",
		"jpg" : "image/jpeg",
		"jpeg" : "image/jpeg",
		"gif" : "image/gif"
	}

	app.listen("80", "static.rong360.com",function(){
		console.log("Server startup...");
	});


	app.use(function (req, res) {
		var origPath = req.path,
			target = {};

		if( origPath.indexOf("favicon.ico") >= 0 ){
			res.end();
		}else{
			target.path = origPath.replace("/prd/","/src/")
								 .replace(/@.*-.*(\.\w+)$/,"$1");

			console.log("Request: " + origPath);
			console.log("Get: " + target.path);
			target.path = path.join(root,target.path);
			target.ext = path.extname(target.path).substring(1);
			res.set( "Content-Type", contentType[target.ext] );
			if( ["js","css"].indexOf( target.ext ) > -1 ){
				target.tag =origPath.match(/@([^\\\/-]+)/)[1];
				compile.compileServer(target, res);
			}else{
				res.sendFile(target.path);
			}
		}

	});

}