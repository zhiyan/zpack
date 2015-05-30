function run( cmd ){
    var command = require( "./lib/" + cmd + ".js" );
    command.run();
}

module.exports = {
    run : run
}