var help = require('u-help');
var pkg = require("../package.json");

module.exports.run = function(){

	help.show('zpack v' + pkg.version,{
	  "命令": {
	    init: '初始化项目',
	    pack: '打包代码',
	    min: '压缩混淆代码',
	    img: '图片目录压缩',
	    watch : '监视代码修改',
	    sync: '同步代码到开发机',
	    server: '本地调试服务器'
	    install: '安装组件',
	    update: '更新组件',
	    remove: '删除组件',
	    publish: '发布组件'
	  }
	});
	
}