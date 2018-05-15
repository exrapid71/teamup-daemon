console.log("Bot is start");

var file = require('fs');
var mysql = require('mysql');
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

//null gelince bide yer mekan isimleri ve database connection
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
        q: 'yazılım',
        'location.address': 'Turkey',
        sort_by: 'date'
    };
    //q: 'hackathon'
    //q:'yazılım',
    //'location.address' : 'Turkey'
    var eventName;
    var eventId;
    var eventUrl;
    var eventStartdate;
    var eventThumbnail;
    var eventDescription;
    var eventData = [];
    api.search(params, function (error, data) {
        if (error) {
            console.log(error.message);
        }
        else {
            saveJson(data);
            var events = data.events;

            console.log(events.length);
            for (var i = 0; i < events.length; i++) {
                var eventInfo = [];
                console.log("i " + i);
                eventName = events[i].name.text;
                eventId = events[i].id;
                eventUrl = events[i].url;
                eventStartdate = events[i].start.local;
                eventThumbnail = events[i].logo.url;
                eventDescription = events[i].description.text;
                eventInfo.push([
                    eventName,
                    eventId,
                    eventUrl,
                    eventStartdate,
                    eventThumbnail,
                    eventDescription
                ]);
                eventData.push([
                    eventName,
                    eventId,
                    eventUrl,
                    eventStartdate,
                    eventThumbnail,
                    eventDescription
                ]);

                checkEventDatabase(eventId, eventInfo);
            }
            endConnection();

        }

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

    handleDisconnect();
    connection.connect(function (err) {
        if (err) {
            console.log("cannot connect");
        }
        else {
            console.log("Connected!");
        }
    });
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            saveEventDatabase(event);
        } else {
            throw err;
        }
    });
    connection.query('INSERT INTO `event` (`name`, `eventid`, `url`, `start`, `thumbnail`,`description`) VALUES ?', [event], function (error, results, fields) {
        if (error) {
            throw error;
        }
        else {
            console.log(results.insertId);
        }
    });
}

function checkEventDatabase(eventId, eventInfo) {
    var eventIds;
    handleDisconnect();
    connection.connect(function (err) {
        if (err) {
            console.log("cannot connect");
        }
        else {
            console.log("Connected!");
        }
    });
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            checkEventDatabase(eventId, eventInfo);
        } else {
            throw err;
        }
    });
    var sql = 'SELECT eventid FROM event';
    connection.query(sql, [eventIds], function (error, results, fields) {
        if (error) {
            throw error;
        }
        else {
            console.log(results[0].eventid);
            var index = 0;
            for (var i = 0; i < results.length; i++) {
                if (results[i].eventid === eventId) {
                    console.log(results[i].eventid);
                    index++;
                    break;
                }
            }
            if (index) {
                console.log(eventId + " Same Event");
            }
            else {
                saveEventDatabase(eventInfo);
            }
        }


    });


}

function endConnection() {
    connection.end(function (err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
    });
}

function handleDisconnect() {

    connection.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

