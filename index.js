var fs = require("fs-extra");
var path = require("path");

// expose zpack
module.exports = {
    run : run
}

/**
 * zpack命令入口
 * @param  {String} cmd 命令名称
 */
function run( cmd ){
	var cmdPath = path.join(__dirname, "lib",cmd + ".js");
	if( fs.existsSync( cmdPath) ){
		require( cmdPath ).run();
	}else{
		console.log("Not found the command.");
	}
}