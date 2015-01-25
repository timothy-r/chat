var UserStore = require('../lib/user_store.js'),
    assert = require('assert'),
    _ = require('underscore');

describe('UserStore', function() {
    
    beforeEach(function(done) {
        UserStore.clear();
        done();
    });

    describe('create', function() {
        it('should return a user object', function() {
            var user = UserStore.create();
            assert(_.has(user, 'name'));
            assert.equal(null, user.name);
            
            assert(_.has(user, 'colour'));
            assert(_.isString(user.colour));

            assert(_.has(user, 'id'));
            assert(_.isString(user.id));
        });
    });

    describe('update', function() {
        it('should update users objects in the store', function() {
            var user = UserStore.create();
            var name = 'Terry';
            user.name = name;
            UserStore.update(user);
            var result = UserStore.get(name);
            assert.equal(user, result);
        });
    });

    describe('get', function() {
        it('should return null when store is empty', function() {
            var name = 'Terry';
            var result = UserStore.get(name);
            assert.equal(null, result);
        });

        it('should return null when not found', function() {
            var user = UserStore.create();
            user.name = 'Donny';
            UserStore.update(user);
            var result = UserStore.get('Other name');
            assert.equal(null, result);
        });
    });
});
