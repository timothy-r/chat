// Array with some colours
var colours = [];

function init() {
    colours = [ 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet' ];
    colours.sort(function(a,b) { return Math.random() > 0.5; } );
}

init();

exports.get = function() {
    if (colours.length == 0) {
        init();
    }
    return colours.shift();
}
