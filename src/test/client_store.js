var ClientStore = require('../lib/client_store.js'),
    assert = require('assert'),
    _ = require('underscore');

describe('ClientStore', function() {
    
    beforeEach(function(done) {
        ClientStore.clear();
        done();
    });

    describe('create', function() {
        it('should return a client object', function() {
            var client = ClientStore.create();
            assert(_.has(client, 'name'));
            assert.equal(null, client.name);
            
            assert(_.has(client, 'colour'));
            assert(_.isString(client.colour));

            assert(_.has(client, 'id'));
            assert(_.isString(client.id));
        });
    });

    describe('update', function() {
        it('should update clients objects in the store', function() {
            var client = ClientStore.create();
            var name = 'Terry';
            client.name = name;
            ClientStore.update(client);
            var result = ClientStore.get(name);
            assert.equal(client, result);
        });
    });

    describe('get', function() {
        it('should return null when store is empty', function() {
            var name = 'Terry';
            var result = ClientStore.get(name);
            assert.equal(null, result);
        });

        it('should return null when not found', function() {
            var client = ClientStore.create();
            client.name = 'Donny';
            ClientStore.update(client);
            var result = ClientStore.get('Other name');
            assert.equal(null, result);
        });
    });
});
