var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;
var pkg = require("./config.json");
var util = require("./util");
var root = process.cwd();

module.exports.run = function(){

	var componentName = util.getModuleName();

	exec( rsyncBuild() , cb );


	/**
	 * rsync命令构造
	 * @return {String]}     
	 */
	function rsyncBuild(){
		return 'rsync -ave ssh ./ ' + pkg.user+'@'+pkg.repo+':/home/rong/components/'+componentName;
	}

	/**
	 * 回调函数
	 * @param  {String}   error  
	 * @param  {String}   stdout 
	 * @param  {String}   stderr 
	 */
	function cb(error, stdout, stderr) {
	    console.log(stdout);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }else{
	    	console.log("Component " +( type === "update" ? "updated" : "installed")+ "!")
	    }
	}
	
}