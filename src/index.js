'use strict';
const Alexa = require("alexa-sdk");
const appId = ''; //'amzn1.echo-sdk-ams.app.your-skill-id';

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    // alexa.dynamoDBTableName = 'awesomeBoard'; TODO add dynamoDB integration
    alexa.registerHandlers(handlers, awesomeHandlers);
    alexa.execute();
};

const testUsers = [
    "yyc",
    "johndoe"
];

const sampleAwesomeness = [
    {
        "user": "yyc",
        "awesomeness": "created this awesome board skill"
    },
    {
        "user": "johndoe",
        "awesomeness": "enabled this awesome board skill"
    }
];

const awesomeBoard = {
    "users": testUsers,
    "awesomeList": sampleAwesomeness
}

const handlers = {
    'NewSession': function () {
        this.emit(':ask', 'Welcome to Awesome Board. Ask whether are we awesome, ' +
            'or say add user to a new Awesome Board user. ' +
            'Say cancel to quit.');
    },
    "AMAZON.StopIntent": function () {
        this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function () {
        this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest': function () {
        this.emit(":tell", "Goodbye!");
    }
};

const awesomeHandlers = {
    'AwesomeBoardSummaryIntent': function () {
        let numOfUsers = awesomeBoard.users.length;
        let numOfAwesomeness = awesomeBoard.awesomeList.length;
        if (numOfAwesomeness > 0) {
            this.emit(':ask', 'Yes we are awesome!' +
                `There are ${numOfAwesomeness} awesomeness from ${numOfUsers} users` +
                'To check the awesomeness of an user, ask why user, johndoe, for example, is awesome.');
        } else {
            this.emit(':ask', 'No, we are awful. ' +
                'Say add user and spell user name to add user to the Awesome Board. ' +
                'Say add new awesomeness and user name to make us awesome! ');
        }
    },
    'AwesomenessByUserIntent': function () {
        let awesomeUser = this.event.request.intent.slots.user.value;
        let awesomeness = [];
        sampleAwesomeness.forEach(function (e) {
            if (e.user === awesomeUser) {
                awesomeness.push(e.awesomeness)
            }
        });
        if (awesomeness.length > 0) {
            let output = "";
            awesomeness.forEach(function (e) {
                output += e + ".";
            });
            this.emit(':tell', `${awesomeUser} is awesome. Because ${awesomeUser} ${output}`);
        } else {
            this.emit(':tell', `Sorry. User ${awesomeUser} is not awesome. Bye.`);
        }
    }
}