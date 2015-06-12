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


#### 特点
* js/css打包压缩混淆自动化
* 模块化: commonJS模块方案
* js模板引擎的支持：mustach(hogan)/handlebars
* css支持sass/less/stylus预编译器
* 支持ES6(Babel处理),可直接在代码里用es6，自动转为es5兼容
* 支持同步(sync)代码到服务器/开发机
* 支持图片自动压缩优化
* 本地代码修改watch监听功能
* 本地开启server服务器，自动替换线上代码功能
* webpack支持，可配置将js/css打包为一个文件
* js/css版本号支持

### 配置文件 zpack.config.json

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
            }
            
        ] ,

    }



### 支持模板类型

* Handlebars
* Mustache
* strintg
* html

### 支持的样式引擎

* SCSS/SASS
* Less
* Stylus

### 基本命令

* init: '初始化项目',
* pack: '打包代码',
* min: '压缩混淆代码',
* img: '图片目录压缩',
* watch : '监视代码修改',
* sync: '同步代码到开发机',
* server: '本地调试服务器'

### stylesheet的两种模式

* zpack.config.json中exports写入，单独导出文件
* js文件中 `require("a.scss")` 会将js和css混编入一个js文件，适合SPA
