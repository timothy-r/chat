var Channel = require('../lib/channel'),
    assert = require('assert');

describe('Channel', function() {
    describe('construct', function() {
        it('should have a name', function(){
            var name = 'chan.1';
            var channel = new Channel(name);
        });

    });
});

