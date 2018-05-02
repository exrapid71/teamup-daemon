console.log("Bot is start");

//for writing json file
var file = require('fs');
//for mysql database connection
var mysql = require('mysql');
//for eventbrite search
var eventbriteAPI = require('node-eventbrite');
var token = 'OOQE6TLKHU6LZS42MR2E';


var connection = mysql.createConnection({
    host: 'zpj83vpaccjer3ah.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
    user: 'rhyvl5hjprzbtgcl',
    password: 'h6zby9jnvxiwiwnq',
    database: 'm09ejdlb4hbxrn45'
});


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
        'location.address': 'Turkey',
        sort_by: 'date'
    };
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
            var events = data.events;
            for (var i = 0; i < events.length; i++) {
                var eventInfo = [];
                eventName = events[i].name.text;
                eventId = events[i].id;
                eventUrl = events[i].url;
                eventStartdate = events[i].start.local;
                eventThumbnail = events[i].logo.url;
                eventInfo.push([
                    eventName,
                    eventId,
                    eventUrl,
                    eventStartdate,
                    eventThumbnail
                ]);
                eventData.push([eventName, eventId, eventUrl, eventStartdate, eventThumbnail]);
                checkEventDatabase(eventId,eventInfo);
            }

            saveJson(eventData);
        }
        //cannot end connection
        //endConnection();
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
function checkEventDatabase(eventId,eventInfo) {
    var eventIds;
    connection.connect(function (err) {
        if (err) {
            console.log("cannot connect");
        }
        else {
            console.log("Connected!");
        }
    });
    var sql = 'SELECT id FROM event';
    connection.query(sql, [eventIds], function (error, results, fields) {
        if (error) {
            throw error;
        }
        else {
            console.log(results[0].id);
            var index = 0;
            for (var i = 0; i < results.length; i++) {
                if (results[i].id === eventId) {
                    index++;
                    break;
                }
            }
            console.log(index);
            if (index) {
                console.log(eventId+" Same Event");
            }
            else {
                saveEventDatabase(eventInfo);
            }
        }
    });


}

function endConnection() {
    connection.end();
    console.log("connection closed");
}
