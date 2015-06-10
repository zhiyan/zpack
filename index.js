// expose zpack
module.exports = {
    run : run
}

/**
 * zpack命令入口
 * @param  {String} cmd 命令名称
 */
function run( cmd ){
    var command = require( "./lib/" + cmd + ".js" );
    command.run();
}