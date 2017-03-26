'use strict';
var Alexa = require("alexa-sdk");
var appId = ''; //'amzn1.echo-sdk-ams.app.your-skill-id';

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    // alexa.dynamoDBTableName = 'awesomeBoard'; TODO add dynamoDB integration
    alexa.registerHandlers(newSessionHandlers);
    alexa.execute();
};