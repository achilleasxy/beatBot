/**
*  @fileoverview Bot API. General bot initialisation and actions.
*
*  @author       Marios Tzakris
*
*  @requires     NPM:facebook-chat-api
*  @requires     ../config/facebook
*  @requires     ./chat
*  @requires     ./jukebox
*  @requires     ./printer
*  @requires     ./social
*/
var facebookConfig = require('../config/facebook');
var login = require('facebook-chat-api');
var chat = require('./chat');
var jukebox = require('./jukebox');
var printer = require('./printer');
var social = require('./social');
// Module Nested Actions
var actions = {
  jukebox: jukebox.resolve,
  say: chat.resolve,
  print: printer.resolve,
  social: social.resolve
};
// -----------------------------------------------------------------------------
/** Initialize FB event listener.
* @method start
* @param {Function} callback - Call when ready.
*/
// -----------------------------------------------------------------------------
function start (callback) {
  login({
    email: facebookConfig.username,
    password: facebookConfig.password
  }, function callback (error, api) {
    if (error) return console.error(error);
    // Inject api to nested modules
    chat.init(api);
    jukebox.init(api);
    console.log('Listening...');
    api.listen(processEvent);
  });
}
// -----------------------------------------------------------------------------
/** Process FB api event.
* @method processEvent
* @param {Object} error - Error.
* @param {Object} message - fb event object.
*/
// -----------------------------------------------------------------------------
function processEvent (error, message) {
  if (error) console.log(error);
  resolveMessage(message);
}
// -----------------------------------------------------------------------------
/** Check if bot is being called and figure out what action take.
* @method resolveMessage
* @param {Object} message - fb event object.
*/
// -----------------------------------------------------------------------------
function resolveMessage (message) {
  // Detect if someone is talking to you.
  var areYouTalkingToMe = message.body.startsWith(facebookConfig.nickname);
  // If its not about you stay out.
  if (!areYouTalkingToMe) return 0;
  // Otherwise locate action
  // If it is something like this. BeatBot play <url>
  var parts = message.body.split(' ').slice(1, -1);
  resolveAction(message, parts);
}
// -----------------------------------------------------------------------------
/** Read message and resolve to particular action based on key words. This needs
* to become smarter as a function and not rely only on key words and nested key
* word matching, it should handle phrases and conversation context (hard)
* @method resolveAction
* @param {Object} message - fb event object.
*/
// -----------------------------------------------------------------------------
function resolveAction (message, parts) {
  // Check if user is asking for a suggestion. This is different from key word
  // matching since it is a phrase.
  if (parts.join('_').toLowerCase() === 'i_want_to_share') {
    action = actions.social;
  } else {
    var key = parts[0];
    var action = actions[key];
  }
  if (action) {
    action(message, parts);
  }
}
/**
* Bot module.
* @module Api/Bot
*/
module.exports = {
  start: start
};