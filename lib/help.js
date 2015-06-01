var help = require('u-help'),
	pkg = require("../package.json");

module.exports.run = function(){
	help.show('zpack v' + pkg.version,{
	  "命令": {
	    init: '初始化项目',
	    pack: '打包代码',
	    min: '压缩混淆代码',
	    watch : '监视代码修改',
	    sync: '同步代码到开发机',
	    server: '本地调试服务器'
	  }
	});
}