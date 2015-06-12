var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;

var root = process.cwd();
var pkg = require("../package.json");
var configFilePath = path.join(root,pkg.configFile);

module.exports.run = function(){

	var dirArr = root.split( path.sep );
	var moduleName = dirArr[dirArr.length-1];
	var defaultConfig = {
		"name" : moduleName,
		"exports" : []
	}
	if( !fs.existsSync( configFilePath ) ){
		fs.mkdirs( path.join(root,"src")  );
		fs.mkdirs( path.join(root,"images/.src")  );
		fs.mkdirs( path.join(root,"html")  );
		fs.mkdirs( path.join(root,"dev")  );
		fs.mkdirs( path.join(root,"prd")  );
		fs.writeJson( path.join(root,".dev"),{"dev":"","user":"rong","path":""})
		fs.writeJson( path.join(root,"zpack.config.json"),defaultConfig)
		console.log("zpack工程创建成功!")
	}else{
		console.log("[warning] " + pkg.configFile + "文件已经存在")
	}
	
}