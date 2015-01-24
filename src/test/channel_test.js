var Channel = require('../lib/channel'),
    assert = require('assert'),
    Mockman = require('mockman');

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
            var type = 'message';
            var obj = {};
            var mock_builder = Mockman.instance('subscriber').shouldReceive('sendUTF').once();
            channel.subscribe(mock_builder.getMock()());
            channel.broadcast(type, obj);

            Mockman.close();
        });
    });
    describe('send', function() {
        it('should send an object to only one subscriber', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var sub_1 = Mockman.instance('subscriber').shouldReceive('sendUTF').once().getMock()();
            var id_1 = channel.subscribe(sub_1);
            var sub_2 = Mockman.instance('subscriber').shouldReceive('sendUTF').never().getMock()();
            var id_2 = channel.subscribe(sub_1);
            
            var result = channel.send(id_1, type, obj);
            assert(result);

            Mockman.close();
        });

        it('should send an object to no subscribers if none exist', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var result = channel.send('id', type, obj);
            assert.equal(false, result);
        });

        it('should send an object to no subscribers if none are identified', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var sub = Mockman.instance('subscriber').shouldReceive('sendUTF').never().getMock()();
            channel.subscribe(sub);
            
            var result = channel.send('not an id', type, obj);
            assert.equal(false, result);

            Mockman.close();
        });
    });

    // how to test history? via broadcast('history') ? or send('history', subscriber_id) ?
    describe('history', function() {
        it('should store its own history', function() {
            var history = [];
            var channel = new Channel('test', history);
            
        });
    });
});

