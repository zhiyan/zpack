void function(){

	var path = require("path");
	var root = process.cwd();

	/**
	 * 	解析导出文件列表
	 * @param  {Array} arr  
	 * @param  {String} type 
	 * @return {Array}      
	 */
	this.analyze = function( arr, type ){
		arr = [].concat( arr );
		arr = arr.map(function(v,i){
			var str = ( typeof v === "string" ) ? v : v.path,
				match = str.match(/^(.*)\/(.*)\.([^\.]*)$/);
			return {
				"source" : path.join(root,"src",str),
				"pathname" : path.join(root,type,match[1]),
				"name" : match[2],
				"ext" : match[3],
				"fullname" : match[2]+"."+match[3],
				"noversion" : v.noversion || false
			};
		});
		return arr;
	}

	/**
	 * 判断是否js
	 * @param  {Mixed}  obj 
	 * @return {Boolean}     
	 */
	this.isJS = function( obj ){
		var name = ( typeof obj === "string" ) ?  obj : obj.path;
		return /\.js$/.test( name );
	}

	/**
	 * 判断是否css
	 * @param  {Mixed}  obj 
	 * @return {Boolean}     
	 */
	this.isCSS = function( obj ){
		var name = ( typeof obj === "string" ) ?  obj : obj.path;
		return /(\.css|\.less|\.scss|\.sass|\.styl)$/.test( name );
	}


	module.exports = this;
	
}.call({})