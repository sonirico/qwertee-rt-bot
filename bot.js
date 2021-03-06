var config = require('./config.js');
var Twitter = require('twit');

var client = new Twitter(config);

var qwerteeAccount = {
    id: '120118721',
    username: 'qwertee',
    last_tweet_id: null
};

var retweet = function (tweet) {
    return new Promise(function (resolve, reject) {
        console.log('Request', 'statuses/retweet/' + tweet.id_str);
        client.post('statuses/retweet/' + tweet.id_str, function(err, response) {
            if (response) {
                console.log(response);
                console.log('Retweeted!!!');
                resolve(response);
            }
            // if there was an error while tweeting
            if (err) {
                console.log('Something went wrong while RETWEETING... Duplication maybe...');
                console.error(err);
                resolve(err);
            }
        });
    });

};

var search = function (params) {
    return new Promise(function (resolve, reject) {

        var newParams = {};
        newParams.id = params.id;

        if (params.last_tweet_id) {
            newParams.since_id = params.last_tweet_id;
        }

        client.get('statuses/user_timeline', newParams, function (error, data) {
            if (! error) {

                data.forEach(function (tweet, index) {

                    retweet(tweet).then(function (response) {

                        if ("object" == typeof response) {
                            if (! qwerteeAccount.last_tweet_id) {
                                qwerteeAccount.last_tweet_id = response.id_str;
                            }
                        }

                    }).catch(function () {
                        qwerteeAccount.last_tweet_id = tweet.id_str;
                        return;
                    });

                });

            } else {
                console.error('Something went wrong while searching...', error);
                resolve(error);
            }
        });
    });
};


var getDelay = function () {
    return parseInt(Math.random() * 100 + 10) * 1000;
};


var loopHandler = null;
var loopDelay = 0;
var loop = function () {


    clearTimeout(loopHandler);

    loopHandler = setTimeout(function () {

        loopDelay = getDelay();

        var params = {
            id: qwerteeAccount.id,
            last_tweet_id: qwerteeAccount.last_tweet_id || null
        };

        search(params).then(function (smth) {

            console.log(smth);
            loop();
        });

    }, loopDelay);
};

loop();
