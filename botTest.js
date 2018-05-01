console.log("Bot is start");

//for writing json file
var file = require('fs');
//for mysql database connection
var mysql = require('mysql');
//for eventbrite search
var Eventbrite = require('eventbrite');


var eventbriteAPI = require('node-eventbrite');
var token = 'OOQE6TLKHU6LZS42MR2E';

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'exrapid71',
    database: 'teamup',
    multipleStatements: 'true'
});
var datas;
eventBriteSearch();

function eventBriteSearch() {

    try {
        var api = eventbriteAPI({
            token: token,
            version: 'v3'
        });
    } catch (error) {
        console.log(error.message);
    }
    var params = {
        q: 'hackathon',
        sort_by: 'date'
    };
    //q:'yazılım',
    var eventName;
    var eventId;
    var eventUrl;
    var eventStartdate;
    var eventThumbnail;
    var eventData = [];
    api.search(params, function (error, data) {
        if (error) {
            console.log(error.message);
        }
        else {
            //console.log(JSON.stringify(data));
            var events = data.events;

            for (var i = 0; i < events.length; i++) {
                var eventInfo = [];

                eventName = events[i].name.text;
                //eventInfo.push(eventName);
                eventId = events[i].id;
                //eventInfo.push(eventId);
                if (events[i].url === null) {
                    eventUrl = 1;
                }
                else {
                    eventUrl = events[i].url;
                }

                //eventInfo.push(eventUrl);
                eventStartdate = events[i].start.local;
                //eventInfo.push(eventStartdate);
                eventThumbnail = 1;
                //eventInfo.push(eventThumbnail);
                eventInfo.push([
                    eventName,
                    eventId,
                    eventUrl,
                    eventStartdate,
                    eventThumbnail
                ]);
                eventData.push([
                    eventName,
                    eventId,
                    eventUrl,
                    eventStartdate,
                    eventThumbnail
                ]);

                if (!(checkEventDatabase(eventId))) {
                    console.log("SameEvent");
                }
                else {
                    saveEventDatabase(eventInfo);
                }
                //eventName.push(event);
                //saveEventDatabase(eventInfo);
                //console.log(eventInfo);

            }
            //console.log(eventinfo);
            saveJson(eventData);

        }
        connection.end();
    });
}


function saveJson(textArray) {
    var json = JSON.stringify(textArray, null, '\t');

    file.writeFile("data.json", json, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

function saveEventDatabase(event) {

    connection.connect(function (err) {
        if (err) {
            console.log("cannot connect");
        }
        else {
            console.log("Connected!");
        }
    });
    connection.query('INSERT INTO `event` (`name`, `id`, `url`, `start`, `thumbnail`) VALUES ?', [event], function (error, results, fields) {
        if (error) {
            throw error;
        }
        else {
            console.log(results.insertId);
        }
    });
}

function checkEventDatabase(eventId) {
    var eventIds;
    connection.connect(function (err) {
        if (err) {
            console.log("cannot connect");
        }
        else {
            console.log("Connected!");
        }
    });
    //var query = "SELECT * FROM posts WHERE title=" + mysql.escape("Hello MySQL");
    //connection.query('SELECT id FROM event WHERE id = ?', [eventIds] , function (error, results, fields) {
    var sql = 'SELECT id FROM event WHERE id = ' + connection.escape(eventId);
    connection.query(sql, function (error, results, fields) {
        if (error) {
            throw error;
        }
        else {
            console.log(results[0].id);
            if (results[0].id === eventId) {
                return 1;
            }
            else {
                return 0;
            }
        }

    });


}