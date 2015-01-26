$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    var rooms = $('#rooms');
    
    // store colour and name as a client object
    var myColour = false, myName = false;

    var room = 'lobby', room_list = [];

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection - parameterize the endpoint
    var connection = new WebSocket('ws://192.168.59.103:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose name:');
    };

    connection.onerror = function (error) {
        content.html($('<p>', { text: 'There\'s a problem with your connection or the server is down.' } ));
    };

    // handle incoming messages to the socket
    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
        }
        
        displayRoomName(room);

        if (json.type === 'colour') {
            myColour = json.data;
            status.text(myName + ': ').css('color', myColour);
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
            // clear rooms list and re-populate
            rooms.html('');
            room_list = json.data.body;

            for (var r in room_list) {
                // attach listener to each room item to enable room switching
                var rm = room_list[r];
                console.log(rm);
                rooms.append('<li><a id="' + rm.id + '" href="#">' + rm.name + '</a></li>');
                
                $( "#" + rm.id ).click(function(e) {
                    // send a room object or just its id? 
                    var new_room = e.target.id;
                    console.log('element ' + e.target.id + ' clicked. room = ' + new_room);
                    connection.send(
                        JSON.stringify(
                            { body: new_room, action: 'subscribe', room: new_room }
                        )
                    );
                    // clear the message window in anticipation of the new room content
                    content.html('');
                    room = new_room;
                    // show the room's name 
                    displayRoomName(room);
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
            if (myName === false) {
                myName = msg;
                action = 'set-name';
            }
            // send the message as json
            connection.send(
                JSON.stringify(
                    { body: msg, room: room, action: action }
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
        if (connection.readyState !== 1) {
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
        // show the room's name 
        for (var r in room_list) {
            if (room_list[r].id == id) {
                $('#room-name').html(room_list[r].name);
             }
        }
    }
});
