var gulp = require("gulp");
var webpack = require("gulp-webpack");
var fs = require('fs-extra');
var named = require('vinyl-named');
var uglify = require('uglify-js');
var cleanCss = require('clean-css');
var path = require("path");
var clean = require("gulp-clean");
var noop = require("gulp-nop");
var sass = require('gulp-sass');
var less = require('gulp-less');
var util = require("./util");
var rev = require("gulp-rev");
var root = process.cwd();
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var verPath = path.join(root,"ver");
var verFileName = path.join(verPath,"version.json");
var through = require('through2');
var pkg = require("../package.json")
var config = require( path.join(root,pkg.configFile) );

var styleCompiler = {
    "scss" : sass,
    "sass" : sass,
    "css" : sass,
    "less" : less
};

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

//name
function tagHandler( tag ){
    return through.obj(function (file, enc, cb) {
        file.path = file.path.replace(/(-[^\\\/]+)?(\.\w+)$/,"@"+tag+"$1$2")
        cb(null,file);
    })
}

// ver
function verHandler( type ){
    return through.obj(function (file, enc, cb) {
        file.revOrigPath = path.join(file.base,path.basename(file.revOrigPath));
        file.base = file.revOrigBase = path.join(file.cwd,type);
        cb(null,file);
    })
}
function verManifest(){
    return rev.manifest(verFileName,{base:verPath,merge:true});
};
function verDest(){
    return gulp.dest(verPath);
}

// min
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

// dev
function devHandler( type ){
    return through.obj(function (file, enc, cb) {
        if( type === "dev" ){
            file.path = file.path.replace(/.(\w+)$/,"-dev.$1");
        }
        return cb(null,file);
    })
}

// server
function serverHandler( res, ext ){
    return through.obj(function (file, enc, cb) {
        var fileExt = path.extname( file.path ).substring(1);
        if( !ext || fileExt === ext )
            res.send( String(file.contents) );
        cb(null,file);
    })
}

// js
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


// css
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

// server
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

// clean
function cleanDir( type ){
    fs.emptyDirSync( path.join( root, type ) );
    fs.emptyDirSync( verPath );
}

module.exports = {
    "compileJS" : compileJS,
    "compileCSS" : compileCSS,
    "compileServer" : compileServer,
    "clean" : cleanDir
}