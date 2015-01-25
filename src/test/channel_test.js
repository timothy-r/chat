var Channel = require('../lib/channel'),
    assert = require('assert'),
    Mockman = require('mockman');

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
    });

    describe('subscribe', function() {
        it('should add a subscriber', function() {
            var channel = new Channel('test');
            var user = {id: 'abcde', name: 'test', colour: 'red'};
            var subscriber = {};
            var id = channel.subscribe(user, subscriber);
            assert(user.id == id);
        });
    });

    describe('remove', function() {
        it('should remove a subscriber', function() {
            var channel = new Channel('test');
            var user = {id: 'abcde', name: 'test', colour: 'red'};
            var obj = {};
            var subscriber = Mockman.instance('subscriber').shouldReceive('sendUTF').never().getMock()();
            var id = channel.subscribe(user, subscriber);
            var result = channel.remove(id);
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
            var user = {id: 'abcde', name: 'test', colour: 'red'};
            var subscriber = Mockman.instance('subscriber').shouldReceive('sendUTF').once().getMock()();
            channel.subscribe(user, subscriber);
            channel.broadcast(type, obj);
        });
    });

    describe('send', function() {
        it('should send an object to only one subscriber', function() {
            var channel = new Channel('test');
            var type = 'message';
            var obj = {};
            var user_1 = {id: 'abcde', name: 'test', colour: 'red'};
            var sub_1 = Mockman.instance('subscriber').shouldReceive('sendUTF').once().getMock()();
            var id_1 = channel.subscribe(user_1, sub_1);

            var user_2 = {id: 'xyz', name: 'test', colour: 'red'};
            var sub_2 = Mockman.instance('subscriber').shouldReceive('sendUTF').never().getMock()();
            var id_2 = channel.subscribe(user_2, sub_1);
            
            var result = channel.send(id_1, type, obj);
            assert(result);
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
            var user = {id: 'abcde', name: 'test', colour: 'red'};
            var sub = Mockman.instance('subscriber').shouldReceive('sendUTF').never().getMock()();
            channel.subscribe(user, sub);
            
            var result = channel.send('not an id', type, obj);
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

