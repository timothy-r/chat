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
        it('should add a connection', function() {
            var channel = new Channel('test');
            var connection = Mockman.instance('connection').shouldReceive('sendUTF').never().getMock()();
            var client = {id: 'abcde', name: 'test', colour: 'red', connection: connection};
            var id = channel.subscribe(client);
            assert(client.id == id);
        });
    });

    describe('remove', function() {
        it('should remove a client', function() {
            var channel = new Channel('test');
            var obj = { body: 'message' };
            var connection = Mockman.instance('connection').shouldReceive('sendUTF').never().getMock()();
            var client = { id: 'abcde', name: 'test', colour: 'red', connection: connection };
            channel.subscribe(client);

            // should return true
            var result = channel.remove(client);
            assert(result);

            // confirm that removed connection does not get called
            channel.broadcast('test', obj);
        });
    });

    describe('broadcast', function() {
        it('should send json message to all clients', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {body: "message text"};
            var connection = Mockman.instance('connection').shouldReceive('sendUTF').once().getMock()();
            var client = {id: 'abcde', name: 'test', colour: 'red', connection: connection};
            channel.subscribe(client);
            channel.broadcast(type, obj);
        });
    });

    describe('send', function() {
        it('should send an object to only one client', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var connection_1 = Mockman.instance('connection').shouldReceive('sendUTF').once().getMock()();
            var client_1 = {id: 'abcde', name: 'test', colour: 'red', connection: connection_1 };
            var id_1 = channel.subscribe(client_1);

            var connection_2 = Mockman.instance('connection').shouldReceive('sendUTF').never().getMock()();
            var client_2 = {id: 'abcde', name: 'test', colour: 'red', connection: connection_2 };
            var id_2 = channel.subscribe(client_2);
            
            var result = channel.send(client_1, type, obj);
            assert(result);
        });

        it('should send an object to no connections if none exist', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var client = { id: 'x'}
            var result = channel.send(client, type, obj);
            assert.equal(false, result);
        });

        it('should send an object to no connections if none are identified', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var connection = Mockman.instance('connection').shouldReceive('sendUTF').never().getMock()();
            var client_1 = {id: 'abcde', name: 'test', colour: 'red', connection: connection};
            channel.subscribe(client_1);
            
            var client_2 = { id: 'not an id'}
            var result = channel.send(client_2, type, obj);
            assert.equal(false, result);
        });
    });

    // how to test history? via broadcast('history') ? or send('history', connection_id) ?
    describe('history', function() {
        it('should store its own history', function() {
            var history = [];
            var channel = new Channel('test', history);
            
        });
    });
});

