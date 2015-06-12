var fs = require("fs-extra");
var path = require("path");
var express = require("express");
var app = express();
var compile = require("./compile");
var root = process.cwd();

module.exports.run = function(){

	// extensions map mime type
	var contentType = {
		"js" : "application/javascript",
		"css" : "text/css",
		"html" : "text/html",
		"png" : "image/png",
		"jpg" : "image/jpeg",
		"jpeg" : "image/jpeg",
		"gif" : "image/gif"
	}

	// default hostname listening
	var hostname = "static.rong360.com";

	// default port listenning
	var port = "80";

	app.listen( port, hostname, listenHandler );

	app.use( requestHandler );

	/**
	 * 监听函数
	 */
	function listenHandler(){
		console.log("Server startup...");
	}

	/**
	 * 请求处理
	 * @param  {RequestObject} req 
	 * @param  {ResponseObject} res 
	 */
	function requestHandler(req, res) {
		var origPath = req.path,
			target = {};

		if( origPath.indexOf("favicon.ico") >= 0 ){
			res.end();
		}else{

			// aaa/zpack/bbb/prd/ccc@md5.xx => aaa/bbb/src/ccc.xx
			target.path = origPath.replace("/prd/","/src/")
								 .replace("/zpack/","/")
								 .replace(/@.*(\.\w+)$/,"$1");

			console.log("Request: " + origPath);
			console.log("Get: " + target.path);

			target.path = path.join(root,target.path);
			target.ext = path.extname(target.path).substring(1);

			res.set( "Content-Type", contentType[target.ext] );

			// handle js/css and ignore others. img,ico,eg.
			if( ["js","css"].indexOf( target.ext ) > -1 ){
				// tag is needed to detective which compiler
				target.tag =origPath.match(/@([^\\\/\-\.]+)/)[1];
				target.path = target.path.replace("/zpack/","/");
				compile.compileServer(target, res);
			}else{
				res.sendFile(target.path);
			}
		}

	} 

}