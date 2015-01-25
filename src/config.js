"use strict";

/**
 * Export configuration for the server
 */
module.exports = {
   process : {
        title: 'pub-sub.server'
   },
   channels : {
        current: 'lobby',
        all: [
            'lobby',
            'news'
        ]
   },
   /* default port */
   port : 1337
};
