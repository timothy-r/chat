/**
 * Create message objects to send to clients
 */
module.exports.create = function createMessage(body, user) {
  return {
    time: (new Date()).getTime(),
    body: body,
    author: user.name,
    color: user.colour
  };
}
