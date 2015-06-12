var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;
var util = require("./util");
var root = process.cwd();
var devConfig = fs.readJsonSync(path.join(root,".dev"));

module.exports.run = function( type ){

	var componentName;

	if( process.argv.length === 4 ){
		componentName = process.argv[3];
		exec( rsyncBuild() , cb );
	}else{
		console.log("参数错误");
	}


	/**
	 * rsync命令构造
	 * @return {String]}     
	 */
	function rsyncBuild(){
		return 'rsync -ave ssh ' + devConfig.user+'@'+devConfig.repo+':/home/rong/components/'+componentName + ' ./src/components';
	}

	/**
	 * 回调函数
	 * @param  {String}   error  
	 * @param  {String}   stdout 
	 * @param  {String}   stderr 
	 */
	function cb(error, stdout, stderr) {

		var config = util.readConfigFile();

	    console.log(stdout);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }else{
	    	if( !~config.components.indexOf( componentName ) ){
	    		config.components.push( componentName );
		    	util.writeConfigFile( config );
	    	}
	    	console.log("Component " +( type === "update" ? "updated" : "installed")+ "!")
	    }
	}
	
}