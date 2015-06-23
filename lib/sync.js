var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;
var util = require("./util");
var root = process.cwd();
var devConfig = fs.readJsonSync(path.join(root,".dev"));
var config = util.readConfigFile();

module.exports.run = function(){

	exec( rsyncBuild( "dev" ) , cb );
	exec( rsyncBuild( "images" ) , cb );
	exec( rsyncBuild( "prd" ) , cb );
	exec( rsyncBuild( "ver" ) , cb );


	/**
	 * rsync命令构造
	 * @param  {String} dir 要同步的目录
	 * @return {String]}     
	 */
	function rsyncBuild( dir ){
		return 'rsync -ave ssh ./' + dir + ' ' + devConfig.user+'@'+devConfig.dev+':'+devConfig.path+"/"+config.name;
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
	    	console.log("sync success!")
	    }
	}
	
}