var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;
var pkg = require("../package.json");
var root = process.cwd();
var devConfig = fs.readJsonSync(path.join(root,".dev"));
var config = require( path.join(root,pkg.configFile) );

module.exports.run = function(){

	exec('rsync -ave ssh ./dev '+devConfig.user+'@'+devConfig.dev+':/home/rong/'+config.name,function (error, stdout, stderr) {
	    console.log(stdout);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }else{
	    	console.log("sync success!")
	    }
	})
	
}