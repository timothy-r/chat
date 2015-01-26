$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content'),
        input = $('#input'),
        status = $('#status'),
        channels = $('#channels');
    
    var channel = 'lobby', 
        channel_list = [];

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection - parameterize the endpoint
    var client = {
        name: false,
        email: false,
        colour: false,
        connection: new WebSocket('ws://192.168.59.103:1337')
    };

    client.connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose name:');
    };

    client.connection.onerror = function (error) {
        content.html($('<p>', { text: 'There\'s a problem with your connection or the server is down.' } ));
    };

    // handle incoming messages to the socket
    client.connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
        }
        
        displayRoomName(channel);

        if (json.type === 'colour') {
            client.colour = json.data;
            status.text(client.name + ': ').css('color', client.colour);
            input.removeAttr('disabled').focus();
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].body,
                           json.data[i].colour, new Date(json.data[i].time));
            }
        } else if (json.type === 'message') {
            input.removeAttr('disabled');
            addMessage(json.data.author, json.data.body,
                       json.data.colour, new Date(json.data.time));
        } else if (json.type == 'channel-list') {
            // clear channels list and re-populate
            channels.html('');
            channel_list = json.data.body;

            for (var r in channel_list) {
                // attach listener to each channel item to enable channel switching
                var chan = channel_list[r];
                console.log(chan);
                channels.append('<li><a id="' + chan.id + '" href="#">' + chan.name + '</a></li>');
                
                $( "#" + chan.id ).click(function(e) {
                    // send a channel object or just its id? 
                    var new_channel = e.target.id;
                    console.log('element ' + e.target.id + ' clicked. channel = ' + new_channel);
                    client.connection.send(
                        JSON.stringify(
                            { body: new_channel, action: 'subscribe', channel: new_channel }
                        )
                    );
                    // clear the message window in anticipation of the new channel content
                    content.html('');
                    channel = new_channel;
                    // show the channel's name 
                    displayRoomName(channel);
                });
            }
        }

        // show it all
        console.log('received : ', json);
    };

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            
            var action = 'post-message';
            // send name as the first message
            if (client.name === false) {
                client.name = msg;
                action = 'set-name';
            }
            // send the message as json
            client.connection.send(
                JSON.stringify(
                    { body: msg, channel: channel, action: action }
                )
            );

            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');

        }
    });

    /**
     * This method is optional. If the server wasn't able to respond to the request
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (client.connection.readyState !== 1) {
            status.text('Error');
            input.val('Unable to communicate with the WebSocket server.');
        }
    }, 3000);

    /**
     * Add message to the chat window
     */
    function addMessage(author, message, colour, dt) {
        content.prepend('<p><span style="color:' + colour + '">' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>');
    };

    function displayRoomName(id) {
        // show the channel's name 
        for (var r in channel_list) {
            if (channel_list[r].id == id) {
                $('#channel-name').html(channel_list[r].name);
             }
        }
    }
});
