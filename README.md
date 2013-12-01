HTTP to Jabber Bridge
---------------------

This repository contains a simple bridge between HTTP and Jabber.

The code listens for HTTP-POST requests, and decodes the body from the
submitted JSON.

It is assumed incoming requests will contain two things:

* The name of a chat-room.
   * The room name will be _unqualifed_.  (i.e. "`dev`" rather than "`dev@conference.chat.example.com`".)
* A message.
   * The message may contain HTML-formatting.

When the submission is received it will be posted to the given chat-room.


Rationale
---------

I have several systems which usually notify me by email, however dealing
with email is a pain.  I'd much rather see chat-messages when a backups
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

* Submit a message: `perl client`.


Example
-------

To submit a message via `curl` you can do this:

       curl -X POST  \
         -H "Content-Type: application/json" \
         -d '{"room":"lobby","message":"I like cake."}' \
         http://localhost:9999/

There is [a simple Perl client](client) included within this repository which
uses the `LWP` module to submit a HTTP-request.  Languages such as ruby would
allow equally trivial submission(s).

Steve
--