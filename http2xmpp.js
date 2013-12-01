//
// Simple bridge between HTTP and XMPP.
//
// This server accepts JSON POST requests containing a hash.
// The hash should have two keys:
//
//   room: The room
//
//   message: The message to post.
//
// The room will "lobby", "office", "dev", or similar.  (i.e. Unqualified.)
//
// When the server stats it will join all available rooms, and thus messages
// to non-configured rooms will be ignored.
//
//
// Steve
// --
//


//
// Require Jabber and HTTP libraries..
//
var xmpp = require("node-xmpp");
var http = require("http");


//
//  The configuration file contains our values.
//
var config = require( "./config.js" );



//
// Trivial server for receiving JSON POST requests.
//
var server = http.createServer(function (request, response) {

    //
    //  POST JSON to server root
    //
    if ( request.url == "/" && request.method === 'POST' ) {
        var data = '';
        request.addListener('data', function(chunk) { data += chunk; });
        request.addListener('end', function() {

            //
            // The received data.
            //
            var parsed = {};

            //
            //  Try to parse the JSON body.
            //
            //  If we succeed ensure that all keys have consistent names.
            //
            try {

                var obj = JSON.parse(data);

                //
                //  Strip any ::ffff: prefix.
                //
                parsed['peer'] = request.connection.remoteAddress;
                var strip_prefix = /^::ffff:([0-9.]+)$/i;
                var match = strip_prefix.exec( parsed['peer'] )
                if ( match )
                {
                    parsed['peer'] = match[1].trim()
                }


                //
                // Copy all keys/values from this hash, but make sure
                // the keys are downcased.
                //
                Object.keys(obj).forEach(function (key,val) {
                    var lkey = key.toLowerCase();
                    parsed[lkey] = obj[key]
                })

                //
                //  If we have a room and a message.
                //
                if ( parsed['room'] && parsed['message'] )
                {
                    //
                    // Store interesting things.
                    //
                    var params = {}
                    params.to  = parsed['room'] + config.room_suffix;
                    params.msg = "[" + parsed['peer'] + "] " + parsed['message'];

                    //
                    //  Send the message.
                    //
                    cl.send('<message to="' + params.to + '" type="groupchat"> <body>' + params.msg + '</body><html xmlns="http://jabber.org/protocol/xhtml-im"><body xmlns="http://www.w3.org/1999/xhtml">' + params.msg + ' </body></html></message>')
                    //
                    //  Log to the console too.
                    //
                    console.log( params.msg );
                }
                response.writeHead(200, {'content-type': 'text/plain' });
                response.write( "OK");
                response.end();
            } catch ( e ) {
                response.writeHead(500, {'content-type': 'text/plain' });
                response.write('Error:' + e);
                console.log( "Error: " + e );
                response.end('\n');
            }
        });
    }
    else
    {
        //
        //  If we reach here we've hit an unrecognized end-point,
        // or a valid destination but the wrong HTTP-verb.
        //
        //  Happily HTTP 405 is a sane response-code to return.
        //
        response.writeHead(405, {'content-type': 'text/plain' });
        response.end( "We only accept POST requests, via HTTP." +
                      "Ignoring " +
                      "METHOD:" + request.method + " PATH:" + request.url );
    }
});






//
//  Connect to the Jabber server.
//
var cl = new xmpp.Client({ jid: config.username, password: config.password });


//
//  Setup our online status.
//
cl.addListener('online', function(data) {
    console.log('Connected to chat ' + data.jid.user + '@' + data.jid.domain)

    //
    // set ourselves as online
    //
    cl.send(new xmpp.Element('presence', { }).
            c('show').t('chat'));

    //
    // For each room in the configuration file, join it.
    //
    config.rooms.map( function(rm) {

        //
        // join the notices room.
        //
        cl.send(function() {
            el = new xmpp.Element('presence',
                                  { to: rm + config.room_suffix + "/" + config.resource } );
            x = el.c('x', { xmlns: 'http://jabber.org/protocol/muc' });
            x.c('history', { maxstanzas: 0, seconds: 1});
            return x;
        }());

        console.log( "\tJoined room " + rm + config.room_suffix );
    });


    //
    //  Send a simple keep-alive message.
    //
    setInterval(function() {
        cl.send(' ');
    }, 1000);


    //
    //  Start the HTTP-server now that we're all wired up for chat.
    //
    server.listen(config.port, '::');
});


//
// Error handling.
//
cl.addListener('error', function(e) {
    console.error(e)
    process.exit(1)
})



