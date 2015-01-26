/**
 * Create message objects to send to clients
 */
module.exports.create = function createMessage(body, client) {
  return {
    time: (new Date()).getTime(),
    body: body,
    author: client.name,
    color: client.colour
  };
}
