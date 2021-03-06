node.js HTTP to Jabber Bridge
-----------------------------

This repository contains a simple bridge between HTTP and Jabber.

The node.js server listens for HTTP-POST requests, then submits their
contents to a XMPP/Jabber server.  Effectively this is a proxy/bridge
between HTTP and XMPP.

It is assumed incoming requests will contain two things:

* The name of a chat-room.
   * The room name will be _unqualified_.  (i.e. "`dev`" rather than "`dev@conference.chat.example.com`".)
* The message to submit.
   * The message may contain HTML-formatting.

When the submission is received it will be posted to the specified chat-room.


Rationale
---------

I have several systems which usually notify me by email, however dealing
with email is a pain.  I'd much rather see chat-messages when a backup
starts, or finish, for example.

There are several existing command-line tools which will poke messages
into Jabber servers, for example [sendxmpp](http://packages.debian.org/sendxmpp), but to use these requires that all the host submitting messages have login
details stored locally.

Instead of storing login details, and requiring additional software, using
a HTTP-server for submission is simple.  The access can be controlled via
ACLs, or firewalls, and because HTTP is standard submissions may be
made via `curl`, or your favourite scripting language.


Installation
------------

* Clone the repository: `git clone ..`

* Install the dependencies: `npm install`

* Edit the `config.js` file.

* Start the server: `node html2xmpp.js`.

* Submit a message as a test.
   * There are some simple examples in the `examples` directory.


Example
-------

To submit a message via `curl` you can do this:

       curl -X POST  \
         -H "Content-Type: application/json" \
         -d '{"room":"lobby","message":"I like cake."}' \
         http://localhost:9999/

This sample is included in the [sample client](examples) directory within
this repository, as a simple reference.


RSS Bot
-------

Included within this repository is a simple tool to poll a bunch of RSS
feeds.  Each new entry will be posted to a dedicated "feeds" room, if it
exists, via a simple HTTP POST to the server.

The example is called [rss-announcer](examples/rss-announcer).


Notes
-----

* The chat-server and the HTTP bridge/proxy do not need to be running on
the same host - providing the bridge machine can talk to the chat
server all will be well.
* The bridge will join a number of conference-rooms when it launches.
   * Messages sent to unknown rooms will be ignored.

Steve
--