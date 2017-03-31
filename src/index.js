'use strict';
const Alexa = require("alexa-sdk");
const firebase = require("firebase");
const admin = require('firebase-admin');
const config = require("config.json");
const appId = config.appId;

// Initialize Firebase
firebase.initializeApp(config.firebaseConfig);
admin.initializeApp({
    credential: admin.credential.cert(config.firebaseAdminConfig),
    databaseURL: config.firebaseDatabaseUrl
});

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(handlers, awesomeHandlers);
    alexa.execute();
};

const handlers = {
    'NewSession': function () {
        let firebaseUid = this.event.session.user.accessToken;
        if (firebaseUid) {
            let attributes = this.attributes;
            let self = this;
            admin.auth().createCustomToken(firebaseUid)
                .then(function (customToken) {
                    attributes['customToken'] = customToken;
                    self.emit(':ask', 'Welcome to Awesome Board. Ask whether are we awesome, ' +
                        'or say add user to a new Awesome Board user. ' +
                        'Say cancel to quit.');
                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                });
            return false;
        } else {
            self.emit(':ask', 'Welcome to Awesome Board. Ask whether are we awesome, ' +
                'or say add user to a new Awesome Board user. ' +
                'Say cancel to quit.');
        }
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Goodbye!");
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tellWithLinkAccountCard', "Goodbye!");
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
        let firebaseUid = this.event.session.user.accessToken;
        let self = this;
        if (firebaseUid) {
            console.log("Sign in user " + accessToken);
            firebase.auth().signInWithCustomToken(accessToken).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log('Sign in user error :' + errorCode + ' ' + errorMessage);
                self.emit(':tell', "Something went wrong. Bye.");
            });
        } else {
            console.log("User access token is empty");
            this.emit(':tellWithLinkAccountCard', "Please link the Awesome Board account first.");
        }

        let numOfUsers = 0;
        let numOfAwesomeness = 0;
        let awesomenessesRef = firebase.database().ref("awesomenesses");
        console.log(awesomenessesRef);
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
        }).catch(function (error) {
            console.log(error);
            self.emit(':tellWithLinkAccountCard', "Please link the Awesome Board account first.");
        });
        console.log("AwesomeBoardSummaryIntent event end");
    },
    'AwesomenessByUserIntent': function () {
        console.log("AwesomenessByUserIntent event", JSON.stringify(this.event));
        let awesomeUser = this.event.request.intent.slots.user.value;
        console.log(this.event.request.session.user.userId);
        console.log(this.event.request.session.user.accessToken);
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