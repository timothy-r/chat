var _ = require("underscore");

/**
 * Create message objects to send to clients
 */
module.exports.create = function createMessage(body, client) {
    return {
        time: (new Date()).getTime(),
        body: body,
        client: {
            name: client.name,
            id: client.id,
            colour: client.colour,
            email: _.has(client, 'email') ? client.email : ""
        }
    };
}
