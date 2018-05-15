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
            //console.log(JSON.stringify(data));
            saveJson(data);
            var events = data.events;

            console.log(events.length);
            for (var i = 0; i < events.length; i++) {
                var eventInfo = [];
                console.log("i " + i);
                eventName = events[i].name.text;
                //eventInfo.push(eventName);
                eventId = events[i].id;
                //eventInfo.push(eventId);
                eventUrl = events[i].url;
                /*
                if (events[i].url === null) {
                    eventUrl = 1;
                }
                else {
                    eventUrl = events[i].url;
                }
                */
                //eventInfo.push(eventUrl);
                eventStartdate = events[i].start.local;
                //eventInfo.push(eventStartdate);
                //eventThumbnail = null;
                // patladı
                eventThumbnail = events[i].logo.url;
                //eventInfo.push(eventThumbnail);
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
                //saveEventDatabase(eventInfo);
                /*
                setTimeout(function(){
                    console.log("TimeOut");
                    }, 3000);
                console.log(ch);
                if (check !== 0) {
                    console.log("SameEvent");
                }
                else {
                    saveEventDatabase(eventInfo);
                }
                */

                //eventName.push(event);
                //saveEventDatabase(eventInfo);
                //console.log(eventInfo);

            }
            endConnection();
            //console.log(eventinfo);
            //saveJson(eventData);
            //setTimeout(endConnection(),15000);
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
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            saveEventDatabase(event);                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
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
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            checkEventDatabase(eventId, eventInfo);                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
    //var query = "SELECT * FROM posts WHERE title=" + mysql.escape("Hello MySQL");
    //connection.query('SELECT id FROM event WHERE id = ?', [eventIds] , function (error, results, fields) {
    //var sql = 'SELECT id FROM event WHERE id = ' + connection.escape(eventId);
    var sql = 'SELECT eventid FROM event';
    connection.query(sql, [eventIds], function (error, results, fields) {
        if (error) {
            throw error;
        }
        else {
            //console.log(results);
            console.log(results[0].eventid);
            var index = 0;
            for (var i = 0; i < results.length; i++) {
                if (results[i].eventid === eventId) {
                    console.log(results[i].eventid);
                    index++;
                    break;
                }
            }
            //console.log(index);
            if (index) {
                //fooMessages.splice(index,1);
                console.log(eventId + " Same Event");
            }
            else {
                saveEventDatabase(eventInfo);
            }
            /*
            if (results[0].id === eventId) {

            }
            else {

            }
            */
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

    connection.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

