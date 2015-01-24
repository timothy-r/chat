var Channel = require('../lib/channel'),
    assert = require('assert');

describe('Channel', function() {
    describe('construct', function() {
        it('should have a name', function(){
            var name = 'chan.1';
            var channel = new Channel(name);
            assert.equal(name, channel.name);
        });
    });
    describe('subscribe', function() {
        it('should add a subscriber', function() {
            var channel = new Channel('test');
            var subscriber = {};
            var id = channel.subscribe(subscriber);
            assert(id != null);
        });
    });
    describe('remove', function() {
        it('should remove a subscriber', function() {
            var channel = new Channel('test');
            var subscriber = {'name' : 'fronk'};
            var id = channel.subscribe(subscriber);
            var result = channel.remove(id);
            assert.equal(subscriber, result);
        });
    });
    describe('broadcast', function() {
        it('should send json message to all subscribers', function() {
            var channel = new Channel('test');
            var message = {};
            channel.broadcast(message);

        });
    });
});

