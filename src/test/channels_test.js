/**
 * Test channels module
 */
var Channels = require('../lib/channels'),
    assert = require('assert'),
    _ = require('underscore');

describe('Channels', function() {
    
    /**
     * Ensure Channels are emptied before running tests
     */
    beforeEach(function(done) {
        Channels.clear();
        done();
    });

    describe('add', function() {
        it('should return a Channel instance', function() {
            var name = 'chann', history = [];
            var channel = Channels.add(name, history);
            assert.equal(name, channel.name);
        });
    });

    describe('get', function() {
        it('should return a Channel instance for an id', function() {
            var name = 'chann', history = [];
            var channel = Channels.add(name, history);
            var result = Channels.get(channel.id);
            assert.equal(channel, result);
        });
        it('should return null when no channels exist', function() {
            var name = 'missing';
            var result = Channels.get(name);
            assert.equal(null, result);
        });
        it('should return null when not found', function() {
            var name = 'chann', history = [];
            var channel = Channels.add(name, history);
            var result = Channels.get('not there');
            assert.equal(null, result);
        });
    });

    describe('getByName', function() {
        it('should return a Channel with the given name', function() {
            var name = 'chann', history = [];
            var channel = Channels.add(name, history);
            var result = Channels.getByName(name);
            assert.equal(name, result.name);
        });
        it('should return null when not found', function() {
            var name = 'chann', history = [];
            var channel = Channels.add(name, history);
            var result = Channels.getByName('not there');
            assert.equal(null, result);
        });
        it('should return null when no channels exist', function() {
            var name = 'missing';
            var result = Channels.getByName(name);
            assert.equal(null, result);
        });
    });

    describe('list', function() {
        it('should return an empty array when no Channel exists', function() {
            var result = Channels.list();
            assert(_.isArray(result));
            assert.equal(0, result.length);
        });
        it('should return an array of objects', function() {
            var name = 'chann', history = [];
            var channel = Channels.add(name, history);
            var result = Channels.list();

            assert(_.isArray(result));
            assert.equal(1, result.length);
            assert.equal(channel.id, result[0].id);
            assert.equal(channel.name, result[0].name);
        });
    });

    describe('clear', function() {
        it('should clear the channels', function() {
            var name = 'chann', history = [];
            var channel = Channels.add(name, history);
            Channels.clear();
            var result = Channels.list();
            assert.equal(0, result.length);
        });
    });

    describe('remove', function() {
        it('should return null when Channel does not exist', function() {
            var result = Channels.remove('xyz');
            assert.equal(null, result);
        });
        it('should return Channel when removed', function() {
            var name = 'chann', history = [];
            var channel = Channels.add(name, history);
            var result = Channels.remove(channel.id);
            assert.equal(name, result.name);
            // test that channel was removed
            var result_2 = Channels.get(channel.id);
            assert.equal(null, result_2);
        });
    });
});
