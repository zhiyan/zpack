ZPACK
=====================

##### zpack是一套前端开发工具, 其中包含了
* 本地开发支持环境
* 静态文件编译 css / js
* 开发辅助工具等

## 如何安装 ##

#### 安装前提

##### nodejs & npm
* 版本需大于 0.6
* windows: [http://nodejs.org/dist/v0.8.15/node-v0.8.15-x86.msi](http://nodejs.org/dist/v0.8.15/node-v0.8.15-x86.msi)
* mac: [http://nodejs.org/dist/v0.8.15/node-v0.8.15.pkg](http://nodejs.org/dist/v0.8.15/node-v0.8.15.pkg)
* linux: 自行使用 apt-get(ubuntu) 或 yum(centos) 安装

#### 安装
    
    npm install zpack -g


### 使用

    zpack {命令名}

### zpack.config.json

    {
        "name" : "test" ,         // 组件名称
        "es6" : true, //是否使用es6，默认false

        // 将要导出至 `prd` 和 `dev` 目录的文件列表
        // 其中所有路径, 均相对于 `src` 目录
        "export" : [

            "./scripts/page-a.js" ,   

            // 允许某个文件不含版本号信息 
            {
                "path" : "./styles/page.scss" , 
                "noversion" : true
            } ,

            // js中require的css分离到单独文件, 默认合并
            {
                "path" : "./scripts/page.js" , 
                "separate" : true
            }
            
        ] ,

    }



### 支持模板类型

* Handlebars
* Mustache

### 支持的样式引擎

* SCSS/SASS
* Less

### 基本命令

* init: '初始化项目',
* pack: '打包代码',
* min: '压缩混淆代码',
* sync: '同步代码到开发机',
* server: '本地调试服务器'

### stylesheet的三种模式

* zpack.config.json中exports写入，单独导出文件
* js文件中 `require("a.scss")` 会将js和css混编入一个js文件，适合spa
* js文件中引入，但在zpack.config.json中配置了separate:false，会跟js文件分离，单独写入与js文件名相同的css文件中
