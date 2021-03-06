var fs = require('fs-extra');
var path = require("path");
var gulp = require("gulp");
var webpack = require("gulp-webpack");
var sass = require('gulp-sass');
var less = require('gulp-less');
var rev = require("gulp-rev");
var through = require('through2');
var named = require('vinyl-named');
var uglify = require('uglify-js');
var cleanCss = require('clean-css');
var util = require("./util");
var pkg = require("./config.json");

var root = process.cwd();
var verPath = path.join(root,"ver");
var verFileName = path.join(verPath,"version.json");

// it's difficult to check configFile when run in server mode 
// so default config is needed 
// es6 is open doesn't matter in server mode
var config = util.readConfigFile() || {"es6" : true};

// default css compile handler for deffirent source file extensions
var styleCompiler = {
    "scss" : sass,
    "sass" : sass,
    "css" : sass,
    "less" : less
};

// webpack loaders config
var loadersConfig = [
    { test: /\.json$/, loader: "json"},
    { test: /\.html$|\.string$/, loader: "html" },
    { test: /\.mustache$/, loader: "mustache"},
    { test: /\.handlebars$|\.hbs$/, loader:'handlebars' },
    { test: /\.tpl$|\.smarty$/, loader:'smarty' },
    { test: config.es6 ? /\.es6$|\.js$/ : /\.es6$/, loader:'babel'},
    { test: /\.css$/, loader:'style!css'},
    { test: /\.scss$|\.sass$/, loader: "style!css!sass"},
    { test: /\.less$/, loader: "style!css!less"}
];

// export `compile`
module.exports = {
    "compileJS" : compileJS,
    "compileCSS" : compileCSS,
    "compileServer" : compileServer,
    "clean" : cleanDir
}

var verMapping;
var verCount = 0;


/**
 * 版本号处理中间件
 * 生成版本号映射文件version.json
 * @param  {String} type 编译类型
 * @return {ThroughObject}
 */
function verHandler( type ){
    return through.obj(function (file, enc, cb) {
        var fileName = file.revOrigPath.replace(/^(.*)[\\\/]+/,""),
            filePath = file.base.replace(path.join(file.cwd,type),"").replace(/\\/g,"\/").replace(/^[\\\/]?/,"");
        verMapping[ filePath + "/" + fileName ] = filePath + "/" + fileName.replace(".", "@" + file.revHash + ".");
        if( --verCount === 0 ){
            fs.writeJson( path.join( root, "ver/version.json"),verMapping);
        }
        cb(null,file);
    })
}

/**
 * 代码压缩混淆处理中间件
 * @param  {String} type 编译类型
 * @return {ThroughObject}      
 */
function minHandler( type ){
    return through.obj(function (file, enc, cb) {
        var extname =  path.extname(file.path).substring(1),
            code,
            source = String(file.contents);
        if( type === "prd" ){
            if( extname === "css"){
                code = new cleanCss().minify(source).styles;
            }else if( extname === "js" ){
                code = uglify.minify( source,{fromString: true} ).code;
            }
            file.contents = new Buffer( code );
        }
        return cb(null,file);
    })
}

/**
 * 代码打包中间件  
 * @param  {String} type 编译类型
 * @return {ThroughObject} 
 */
function tagHandler( type ){
    return through.obj(function (file, enc, cb) {
        console.log(type)
        if( type === "dev" ){
            file.path = file.path.replace(/.(\w+)$/,"@dev.$1");
        }else{
            // replace rev default tag `-` to `@`
            file.path = file.path.replace( /-([^\-]+)$/, "@$1");
        }
        return cb(null,file);
    })
}

/**
 * Server中间件
 * @param  {Object} res response对象
 * @param  {String} ext 扩展名
 * @return {ThroughObject}    
 */
function serverHandler( res, ext ){
    return through.obj(function (file, enc, cb) {
        var fileExt = path.extname( file.path ).substring(1);
        if( !ext || fileExt === ext )
            res.send( String(file.contents) );
        cb(null,file);
    })
}

/**
 * 空函数中间件
 * @return {ThroughObjrct}
 */
function noop(){
    return through.obj(function (file, enc, cb) {
        return cb(null,file);
    });
}

/**
 * js文件编译
 * @param  {Array} arr   js文件列表
 * @param  {String} type  编译类型
 * @param  {Boolean} watch 
 */
function compileJS( arr, type, watch ){

    var objArr = util.analyze( arr, type );

    !verMapping && (verMapping = {});
    verCount += objArr.count;

    objArr.forEach(function(v,i){
        var noversion = v.noversion || type === "dev";
        fs.mkdirsSync( v.pathname );
        var config = {
            watch: watch || false,
            module: {
                loaders : loadersConfig
            },
            resolveLoader: {
                root: path.join(__dirname,'..','node_modules')
            },
            resolve:{
                alias: {
                    "jquery" : path.join(root, "src/components/jquery")
                }
            }
        }
        gulp.src( v.source )
            .pipe(named())
            .pipe( webpack(config) )
            .pipe( minHandler( type ) )
            .pipe( noversion ? noop() : rev() )
            .pipe( tagHandler( type ) )
            .pipe( gulp.dest( v.pathname ) )
            .pipe( noversion ? noop() : verHandler(type) )
    });

}


/**
 * CSS文件编译
 * @param  {Array} arr   css文件列表
 * @param  {String} type  编译类型 
 * @param  {Boolean} watch 
 */
function compileCSS( arr, type, watch ){

    var objArr = util.analyze(arr, type );

    !verMapping && (verMapping = {});
    verCount += objArr.count;

    var cb = function(){
        objArr.forEach(function(v,i){
            var noversion = v.noversion || type === "dev";
            fs.mkdirsSync( v.pathname );
            gulp.src( v.source )
                .pipe( styleCompiler[ v.ext ]() )
                .pipe( minHandler( type ) )
                .pipe( noversion ? noop() : rev() )
                .pipe( tagHandler( type ) )
                .pipe( gulp.dest(v.pathname) )
                .pipe( noversion ? noop() : verHandler(type) )
        });
    }

    cb();


    if( watch ){
        gulp.watch( path.join( root, "src","**/*" ), cb );
    }
}

/**
 * 调试服务器编译
 * @param  {Object}   source 源文件对象
 * @param  {Function} cb     回调函数
 */
function compileServer( source, cb ){
    var config,
        stylePath;

    if( source.ext === "css" ){
        for( i in styleCompiler ){
            stylePath = source.path.replace(/\.css$/,"."+i);
            if( fs.existsSync(stylePath) ){
                source.path = stylePath;
                config = i;
                break;
            }
        }
        gulp.src( source.path )
            .pipe( styleCompiler[config]() )
            .pipe( serverHandler( cb ) )
    }else{
        config = {
            module: {
                loaders : loadersConfig
            },
            resolveLoader: {
                root: path.join(__dirname,'..','node_modules')
            }
        };

        gulp.src( source.path )
            .pipe(named())
            .pipe( webpack(config) )
            .pipe( serverHandler( cb ,source.ext) )
    }

}

/**
 * 目录清理
 * 每次压缩/混淆之前清理之前文件
 * @param  {String} type 编译类型
 */
function cleanDir( type ){
    fs.emptyDirSync( path.join( root, type ) );
    type === "prd" && fs.emptyDirSync( verPath );
}