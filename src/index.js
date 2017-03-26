'use strict';
const Alexa = require("alexa-sdk");
const appId = ''; //'amzn1.echo-sdk-ams.app.your-skill-id';

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    // alexa.dynamoDBTableName = 'awesomeBoard'; TODO add dynamoDB integration
    alexa.registerHandlers(newSessionHandlers);
    alexa.execute();
};