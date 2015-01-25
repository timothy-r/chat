var UserStore = require('../lib/user_store.js'),
    assert = require('assert'),
    _ = require('underscore');

describe('UserStore', function() {
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
});
