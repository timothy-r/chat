var Channel = require('../lib/channel'),
    assert = require('assert'),
    Mockman = require('mockman'),
    _ = require('underscore');

describe('Channel', function() {
    
    /**
     * Ensure mock asserts are processed
     */
    afterEach(function(done) {
        Mockman.close();
        done();
    });

    describe('construct', function() {
        it('should have a name', function(){
            var name = 'chan.1';
            var channel = new Channel(name);
            assert.equal(name, channel.name);
        });
        it('should have an id', function() {
            var name = 'Channel Y';
            var channel = new Channel(name);
            assert(_.has(channel, 'id'));
        });
    });

    describe('subscribe', function() {
        it('should add a subscriber', function() {
            var channel = new Channel('test');
            var client = {id: 'abcde', name: 'test', colour: 'red'};
            var subscriber = {};
            var id = channel.subscribe(client, subscriber);
            assert(client.id == id);
        });
    });

    describe('remove', function() {
        it('should remove a subscriber', function() {
            var channel = new Channel('test');
            var client = {id: 'abcde', name: 'test', colour: 'red'};
            var obj = {};
            var subscriber = Mockman.instance('subscriber').shouldReceive('sendUTF').never().getMock()();
            channel.subscribe(client, subscriber);
            var result = channel.remove(client);
            assert.equal(subscriber, result);
            // confirm that removed subscriber does not get called
            channel.broadcast('test', obj);
        });
    });

    describe('broadcast', function() {
        it('should send json message to all subscribers', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var client = {id: 'abcde', name: 'test', colour: 'red'};
            var subscriber = Mockman.instance('subscriber').shouldReceive('sendUTF').once().getMock()();
            channel.subscribe(client, subscriber);
            channel.broadcast(type, obj);
        });
    });

    describe('send', function() {
        it('should send an object to only one subscriber', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var client_1 = {id: 'abcde', name: 'test', colour: 'red'};
            var sub_1 = Mockman.instance('subscriber').shouldReceive('sendUTF').once().getMock()();
            var id_1 = channel.subscribe(client_1, sub_1);

            var client_2 = {id: 'xyz', name: 'test', colour: 'red'};
            var sub_2 = Mockman.instance('subscriber').shouldReceive('sendUTF').never().getMock()();
            var id_2 = channel.subscribe(client_2, sub_1);
            
            var result = channel.send(client_1, type, obj);
            assert(result);
        });

        it('should send an object to no subscribers if none exist', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var client = { id: 'x'}
            var result = channel.send(client, type, obj);
            assert.equal(false, result);
        });

        it('should send an object to no subscribers if none are identified', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var client_1 = {id: 'abcde', name: 'test', colour: 'red'};
            var sub = Mockman.instance('subscriber').shouldReceive('sendUTF').never().getMock()();
            channel.subscribe(client_1, sub);
            
            var client_2 = { id: 'not an id'}
            var result = channel.send(client_2, type, obj);
            assert.equal(false, result);
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

