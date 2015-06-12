var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;
var util = require("./util");
var pkg = require("./config.json");
var root = process.cwd();

module.exports.run = function(){
	var componentName;
	var config = util.readConfigFile();

	if( process.argv.length === 4 ){
		componentName = process.argv[3];
		fs.removeSync( path.join( root, "src/components",  componentName )  );

		var index = config.components.indexOf( componentName );

		if( ~index ){
			config.components.splice(index,1);
	    	util.writeConfigFile( config );
    	}
		console.log("删除组件成功!")
	}else{
		console.log("参数错误");
	}

	// fs.emptyDirSync( path.join( root, componentName ) );
	
}