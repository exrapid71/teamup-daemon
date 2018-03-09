console.log("Bot is start");

//for twitter search
var Twit = require('twit');
var config = require('./config');
var T = new Twit(config);

// for facebook search
var facebook_event= require('facebook-events-by-location-core');
var fsearch = new facebook_event();

//for writing json file
var file = require('fs');
//for mysql database connection
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'exrapid71',
    database : 'teamup'
});

var token = "350169158833909|y5nYTHY7NfuIBy_cPGCvYSd5XHw";
facebook_search();
function facebook_search() {
    //fsearch.accessToken(350169158833909|y5nYTHY7NfuIBy_cPGCvYSd5XHw);
    var token = "350169158833909|y5nYTHY7NfuIBy_cPGCvYSd5XHw";
    // some variable that
    var query ="yazılım maratonu";
    //max distance differance between lat and lang
    var distance = 10000;
    //max results
    var limit = 50;
    //dont know
    var since =1;
    var until =2;

    console.log("Facebook search start");
    fsearch.search({
        "lat": 41.0082,
        "lng": 28.9784,
        "accessToken": token,
        "distance": distance,
        "limit": limit,
        "since": since,
        "until": until
    }).then(function (events) {
        //console.log(JSON.stringify(events));
        //console.log(JSON.stringify(events.place.name));
        console.log("Saving file.");
        saveJson(events);
    }).catch(function (error) {
        console.error(JSON.stringify(error));
    });
    /*
    41.107634090976 38.321154595415 41.0082
    29.032755169024 26.63450717926  28.9784
    */

}





//tsearch();

//twitter search
function tsearch(){

    var keyword ={
        q: '#hackathonturkiye ',
        count: 50
    };
    var tweettext =[];
    T.get('search/tweets', keyword, gotData);

    function gotData(err, data, response) {

        if(err){
            console.log("Can't Work!");
        }
        else{
            var tweets = data.statuses;
            for(var i=0;i<tweets.length;i++) {
                var stweet = tweets[i].text;
                tweettext.push(stweet);
                console.log(stweet);
                saveDatabase(stweet);
            }
            //saveJson(tweettext);
        }
        connection.end();
    }

}


function saveDatabase(text) {
    connection.connect(function(err) {
        if (err){
            console.log("cannot connect");
        }
        else {
            console.log("Connected!");
        }
    });

    connection.query('INSERT INTO tweet SET ?', {text: text}, function (error, results, fields) {
        if (error){
            throw error;
        }
        else{
            console.log(results.insertId);
        }
    });
}

function saveJson(textArray) {
    var json = JSON.stringify(textArray,null, '\t');

    file.writeFile("data.json", json, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}