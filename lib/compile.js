var fs = require('fs-extra');
var path = require("path");
var gulp = require("gulp");
var webpack = require("gulp-webpack");
var noop = require("gulp-nop");
var sass = require('gulp-sass');
var less = require('gulp-less');
var rev = require("gulp-rev");
var through = require('through2');
var named = require('vinyl-named');
var uglify = require('uglify-js');
var cleanCss = require('clean-css');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var util = require("./util");

var root = process.cwd();
var pkg = require("../package.json");
var verPath = path.join(root,"ver");
var verFileName = path.join(verPath,"version.json");
var configPath = path.join(root,pkg.configFile);

// default config that it's difficult to check configFile when run in server mode
// es6 is open doesn't matter
var config = fs.existsSync( configPath ) ? require( configPath ) : {"es6" : true};

// default css compile handler for deffirent source file extensions
var styleCompiler = {
    "scss" : sass,
    "sass" : sass,
    "css" : sass,
    "less" : less
};

// webpack loaders config group
var loadersConfig = {
    "basic" : [
        { test: /\.json$/, loader: "json"},
        { test: /\.html$|\.string$/, loader: "html" },
        { test: /\.mustache$/, loader: "mustache"},
        { test: /\.handlebars$|\.hbs$/, loader:'handlebars' },
        { test: /\.tpl$|\.smarty$/, loader:'smarty' },
        { test: config.es6 ? /\.es6$|\.js$/ : /\.es6$/, loader:'babel'}
        ],
    "style" : [
        { test: /\.css$/, loader:'style!css'},
        { test: /\.scss$|\.sass$/, loader: "style!css!sass"},
        { test: /\.less$/, loader: "style!css!less"}
        ],
    "separate" : [
        { test: /\.css$/, loader:ExtractTextPlugin.extract('style-loader","css-loader')},
        { test: /\.scss$|\.sass$/, loader: ExtractTextPlugin.extract("style-loader","css-loader!sass-loader")},
        { test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader","css-loader!less-loader")}
    ]
}


// export `compile`
module.exports = {
    "compileJS" : compileJS,
    "compileCSS" : compileCSS,
    "compileServer" : compileServer,
    "clean" : cleanDir
}

/**
 * 文件名tag标记处理中间件
 * @param  {String} tag 
 * @return {ThroughObject} 
 */
function tagHandler( tag ){
    return through.obj(function (file, enc, cb) {
        file.path = file.path.replace(/(-[^\\\/]+)?(\.\w+)$/,"@"+tag+"$1$2")
        cb(null,file);
    })
}

/**
 * 版本号处理中间件
 * 修正through中file的path
 * 调和gulp/rev插件和webpack的兼容性
 * @param  {String} type 编译类型
 * @return {ThroughObject}
 */
function verHandler( type ){
    return through.obj(function (file, enc, cb) {
        file.revOrigPath = path.join(file.base,path.basename(file.revOrigPath));
        file.base = file.revOrigBase = path.join(file.cwd,type);
        cb(null,file);
    })
}

/**
 * 版本号主处理逻辑中间件
 * 封装 `gulp-rev`
 * @return {throughObject}
 */
function verManifest(){
    return rev.manifest(verFileName,{base:verPath,merge:true});
}

/**
 * 版本号文件生成目录中间件 
 * @return {ThoughObject}
 */
function verDest(){
    return gulp.dest(verPath);
}

/**
 * 代码压缩混淆处理中间件
 * @param  {String} type 编译类型
 * @return {ThoughObject}      
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
 * @return {ThoughObject} 
 */
function devHandler( type ){
    return through.obj(function (file, enc, cb) {
        if( type === "dev" ){
            file.path = file.path.replace(/.(\w+)$/,"-dev.$1");
        }
        return cb(null,file);
    })
}

/**
 * Server中间件
 * @param  {Object} res response对象
 * @param  {String} ext 扩展名
 * @return {ThoughObject}    
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
 * js文件编译
 * @param  {Array} arr   js文件列表
 * @param  {String} type  编译类型
 * @param  {Boolean} watch 
 */
function compileJS( arr, type, watch ){

    var objArr = util.analyze( arr, type );

    objArr.forEach(function(v,i){
        var noversion = v.noversion || type === "dev";
        fs.mkdirsSync( v.pathname );
        var config = {
            watch: watch || false,
            module: {
                loaders : loadersConfig.basic.concat( v.separate ? loadersConfig.separate : loadersConfig.style )
            },
            resolveLoader: {
                root: path.join(__dirname,'..','node_modules')
            },
            plugins: [
                new ExtractTextPlugin("[name].css")
            ]
        }
        gulp.src( v.source )
            .pipe(named())
            .pipe( webpack(config) )
            .pipe( minHandler( type ) )
            .pipe( noversion ? noop() : rev() )
            .pipe( tagHandler( "pack" ) )
            .pipe( devHandler( type ) )
            .pipe( gulp.dest( v.pathname ) )
            .pipe( noversion ? noop() : verHandler(type) )
            .pipe( noversion ? noop() : verManifest() )
            .pipe( noversion ? noop() : verDest() )
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

    var cb = function(){
        objArr.forEach(function(v,i){
            var noversion = v.noversion || type === "dev";
            fs.mkdirsSync( v.pathname );
            gulp.src( v.source )
                .pipe( styleCompiler[ v.ext ]() )
                .pipe( minHandler( type ) )
                .pipe( noversion ? noop() : rev() )
                .pipe( tagHandler("style") )
                .pipe( devHandler( type ) )
                .pipe( gulp.dest(v.pathname) )
                .pipe( noversion ? noop() : verHandler(type) )
                .pipe( noversion ? noop() : verManifest() )
                .pipe( noversion ? noop() : verDest() )
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

    if( source.tag === "style" ){
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
            module: {},
            resolveLoader: {
                root: path.join(__dirname,'..','node_modules')
            }
        };

        if( source.ext === "css" ){
            config.module.loaders = loadersConfig.basic.concat( loadersConfig.separate )
            config.plugins = [new ExtractTextPlugin("[name].css")];
            source.path = source.path.replace(".css",".js");
        }else{
            config.module.loaders = loadersConfig.basic.concat( loadersConfig.style )
        }

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
    fs.emptyDirSync( verPath );
}