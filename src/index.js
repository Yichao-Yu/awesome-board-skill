'use strict';
const Alexa = require("alexa-sdk");
const firebase = require("firebase");
const config = require("config.json");
const appId = config.appId;

// Initialize Firebase
firebase.initializeApp(config.firebaseConfig);

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(handlers, awesomeHandlers);
    alexa.execute();
};

const handlers = {
    'NewSession': function () {
        this.emit(':ask', 'Welcome to Awesome Board. Ask whether are we awesome, ' +
            'or say add user to a new Awesome Board user. ' +
            'Say cancel to quit.');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Goodbye!");
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function () {
        this.emit(':tell', "Sorry, I didn\'t get that.");
    }
};

const awesomeHandlers = {
    'AwesomeBoardSummaryIntent': function () {
        console.log("AwesomeBoardSummaryIntent event", JSON.stringify(this.event));
        let numOfUsers = 0;
        let numOfAwesomeness = 0;
        let awesomenessesRef = firebase.database().ref("awesomenesses");
        let self = this;
        awesomenessesRef.once('value').then(function (snapshot) {
            numOfUsers = snapshot.numChildren();
            console.log("Current awesome board users ", numOfUsers);
            snapshot.forEach(function (childSnapshot) {
                numOfAwesomeness += childSnapshot.numChildren();
            });
            console.log("Current awesome board awesomeness ", numOfAwesomeness);
            if (numOfAwesomeness > 0) {
                self.emit(':ask', 'Yes we are awesome! ' +
                    `There are ${numOfAwesomeness} awesomeness from ${numOfUsers} users. ` +
                    'To check the awesomeness of an user, ask why user, johndoe, for example, is awesome.');
            } else {
                self.emit(':ask', 'No, we are awful. ' +
                    'Say add user and spell user name to add user to the Awesome Board. ' +
                    'Say add new awesomeness and user name to make us awesome! ');
            }
        });
    },
    'AwesomenessByUserIntent': function () {
        console.log("AwesomenessByUserIntent event", JSON.stringify(this.event));
        let awesomeUser = this.event.request.intent.slots.user.value;
        let awesomenessList = [];
        let awesomenessesRef = firebase.database().ref("awesomenesses/" + awesomeUser);
        let self = this;
        awesomenessesRef.once('value').then(function (snapshot) {
            if (!snapshot.hasChildren()) {
                console.log(`User ${awesomeUser} does not exist.`);
                self.emit(':tell', `Sorry. User <say-as interpret-as="spell-out">${awesomeUser}</say-as> does not exist. Bye.`);
            } else {
                snapshot.forEach(function (childSnapshot) {
                    console.log(JSON.stringify(childSnapshot));
                    awesomenessList.push(childSnapshot.val())
                });
                if (awesomenessList.length > 0) {
                    console.log(`User has ${awesomenessList.length} awesomeness.`);
                    let output = "";
                    let cnt = 1;
                    awesomenessList.forEach(function (e) {
                        output += cnt + ": " + e + " ";
                        cnt++;
                    });
                    self.emit(':tell', `<say-as interpret-as="spell-out">${awesomeUser}</say-as> is awesome. ` +
                        `Because <say-as interpret-as="spell-out">${awesomeUser}</say-as> ${output}`);
                } else {
                    console.log(`User ${awesomeUser} does not have awesomeness.`);
                    self.emit(':tell', `Sorry. User <say-as interpret-as="spell-out">${awesomeUser}</say-as> is not awesome. Bye.`);
                }
            }
        });
    },

}