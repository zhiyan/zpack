var root = process.cwd();
var path = require("path");
var fs = require("fs-extra");
var exec = require("child_process").exec;
var pkg = require("../package.json");
var configFilePath = path.join(root,pkg.configFile);

module.exports.run = function(){
	var dirArr = root.split( path.sep );
	var defaultConfig = {
		"name" : dirArr[dirArr.length-1],
		"exports" : []
	}
	if( !fs.existsSync( configFilePath ) ){
		fs.mkdirs( path.join(root,"src")  );
		fs.mkdirs( path.join(root,"images")  );
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