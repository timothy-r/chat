Try to standarise messages between client and server.

* action, indicates type of message
* body is always a json object with different contents depending on action
* time
* client an object with client details, may be missing? or use server details for non-client originating messages
* channel the affected channel, may be missing?

// message with text from one client to a channel
{
    action: "post-message",
    body: {
        text: "the message"
    },
    channel : {
        id: "12345",
        name: "channel x"
    },
    client: {
        id: "id",
        name: "name",
        email: "email",
        colour: "red"
    }   
}

// message from server to client after getting data from storage
// could be used by clients to populate buddy lists?
// update name / colour / avatar
{
    action: "update-client",
    body: {
        name: "x",
        email: "y",
        id: "a",
        colour: "yellow"
    },
    // the sender not target client
    client : {

    }
}

// on log in from client to server
{
    action: "log-in",
    body: {
        name: "the client name",?
        email: "the client email"
    },
    client: {
        id: "",
        name: "the client name",?
        email: "the client email",
        colour: ""
    }
}

// from server to client, not channel
{
    action: "set-channels",
    body: {
        channels: [{name:"x", id: "1234"} {name: "y", id: "5678"}]
    },

    client: { / NA ??
        id: "id",
        name: "xx",
        email: "yy"
    }
}

// subscribe to channel, from client to server
{
    action: "subscribe",
    body: {
        channel : "id"
    },
    client: {
        id: "id",
        name: "x",
        id: "y"
    }
}

// history, server to client on subscribe
// really just an array of posts
{
    action: "set-history",
    body: {
        posts: [
            {post}
        ]
    },
    channel: {
        name: "chan",
        id: "1234"
    },
    client: {
        id: "server id",
        name: "server name"
    }
}


