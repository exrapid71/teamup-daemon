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
    database: 'm09ejdlb4hbxrn45',
    multipleStatements: 'true'
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
    //q:'yazılım',
    //q: 'hackathon',
    var params = {
        q: 'yazılım',
        'location.address': 'Turkey',
        sort_by: 'date'
    };
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
            var events = data.events;
            var eventInfo = [];
            for (var i = 0; i < events.length; i++) {
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
                eventData.push([eventName, eventId, eventUrl, eventStartdate, eventThumbnail,eventDescription]);
                //checkEventDatabase(eventId, eventInfo);
                saveEventDatabase(eventInfo);
            }

            //saveJson(eventData);
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

            connection.on('error', function (err) {
                console.log('db error', err);
                if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                    checkEventDatabase(eventId, eventInfo);                         // lost due to either server restart, or a
                } else {                                      // connnection idle timeout (the wait_timeout
                    throw err;                                  // server variable configures this)
                }
            });
            var sql = 'SELECT eventid FROM event';
            connection.query(sql, [eventIds], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                else {
                    console.log(results);
                    console.log(results[0].id);
                    var index = 0;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].id === eventId) {
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
