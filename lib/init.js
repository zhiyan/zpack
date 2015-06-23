var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;
var util = require("./util");

var root = process.cwd();
var pkg = require("./config.json");

module.exports.run = function(){

	var moduleName = util.getModuleName();
	var config = util.readConfigFile();
	var defaultConfig = {
		"name" : moduleName,
		"components" : [],
		"exports" : []
	}
	if( !config ){

		"src/scripts,src/styles,src/components,src/images,images,html,dev,prd"
		.split(",")
		.forEach(function( p ){
			fs.mkdirs( path.join(root, p)  );
		});

		fs.writeJson( path.join(root,".dev"),{"dev":pkg.dev,"user":pkg.user,"repo":pkg.repo,"path":pkg.path})
		fs.writeJson( path.join(root,"zpack.config.json"),defaultConfig)
		console.log("zpack工程创建成功!")
	}else{
		console.log("[warning] " + pkg.configFile + "文件已经存在")
	}
	
}