// Wait for Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);

//Data - client side DB
window.ads = [];


localStorage.clear();
localStorage.setItem("firstRun", "true");


if(localStorage["firstRun"] == undefined || localStorage["firstRun"] == "true"){
    // Loading festivals
    $('#installer').addClass('visible');
}


// Cordova is ready
function onDeviceReady(){
    setHeightAndWidth();
    document.addEventListener("backbutton", backButton, false);
    document.addEventListener("touchmove", function(e){e.preventDefault();}, false);
    window.db = window.openDatabase("FestivAllDB", "1.0", "FestivAll Database", 5000000);

    //menu button
    document.addEventListener("menubutton", menuButton, false);
    $('#menu_button').unbind().bind("click", menuButton);

    if(localStorage["firstRun"] == "false"){
        createFestivalsContainer();
        initFestivalsDisplay();
    }

    //Check if the application is running for the first time
    $.ajax({
        url: "http://www.festivall.eu",
        dataType:"html",
        timeout: 8000,
        success:function (changes) {
            if(localStorage["firstRun"] == undefined || localStorage["firstRun"] == "true"){
                console.log('POPULATING DATABASE');
                //populate db
                db.transaction(populateDB, errorCB, successCB);
                localStorage.setItem("firstRun", "true");

            }
            else if(localStorage["firstRun"] == "false"){
                console.log('SYNCRONIZING');
                window.FestivallToaster.showMessage('Sincronizando...');
                sync("http://www.festivall.eu/festivals.json", function(){
                    window.FestivallToaster.showMessage('Sincronização terminada!');
                });
            }
        },
        error: function(model, response) {
            errorInstallingDBCB();
        }
    });
}

// Get the last synchronization date
function getLastSync(callback) {
    var last_sync = localStorage["lastSync"].replace("T"," ").replace("Z","");
    //alert('sync (last sync) : ' + last_sync);
    callback(last_sync);
}

// Get the changes from the server
function getChanges(syncURL, modifiedSince, callback) {
    $.ajax({
        url: syncURL,
        //headers : {'Accept-Encoding' : 'gzip'},
        data: {start_date: modifiedSince},
        dataType:"json",
        success:function (changes) {
            callback(changes);
        },
        error: function(model, response) {
            //window.FestivallToaster.showMessage("Erro na sync");
        }
    });

}

// Apply the changes to cache webSQL database
function applyChanges(response, callback) {
    insertData(response);
    callback();
}

//Synchronization algorithm logic
function sync(syncURL, callback ) {
    getLastSync(function(lastSync){
        getChanges(syncURL, lastSync,
            function (changes) {
                applyChanges(changes, callback);
            }
        );
    }, true);
}

// Populate the database
function populateDB(tx) {
    window.FestivallToaster.showMessage("Base de dados a ser construída...");
    window.FestivallToaster.showMessage("Poderá demorar mais de um minuto");

    tx.executeSql('DROP TABLE IF EXISTS FESTIVALS');
    tx.executeSql('DROP TABLE IF EXISTS SHOWS');
    tx.executeSql('DROP TABLE IF EXISTS DAYS');
    tx.executeSql('DROP TABLE IF EXISTS STAGES');
    tx.executeSql('DROP TABLE IF EXISTS VIDEOS');
    tx.executeSql('DROP TABLE IF EXISTS ABOUT_US');
    tx.executeSql('DROP TABLE IF EXISTS ADS');

    tx.executeSql('CREATE TABLE FESTIVALS(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), country_id INTEGER, ' +
        'coordinates VARCHAR(255), city VARCHAR(255), logo VARCHAR(255), map VARCHAR(255), template VARCHAR(255), ' +
        'tickets_price VARCHAR(255), tickets TEXT(1024), transports TEXT(1024), updated_at DATETIME)');
    tx.executeSql('CREATE TABLE SHOWS(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), festival_id INTEGER, stage_id INTEGER, ' +
        'day_id INTEGER, photo VARCHAR(255), description TEXT(1024), time TIME, updated_at DATETIME)');
    tx.executeSql('CREATE TABLE DAYS(id INTEGER PRIMARY KEY AUTOINCREMENT, festival_id INTEGER, date DATETIME, ' +
        'opening_time TIME, closing_time TIME, updated_at DATETIME)');
    tx.executeSql('CREATE TABLE STAGES(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), festival_id, updated_at DATETIME)');
    tx.executeSql('CREATE TABLE VIDEOS(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), show_id INTEGER, ' +
        'url VARCHAR(255), updated_at DATETIME)');
    tx.executeSql('CREATE TABLE ABOUT_US(id INTEGER PRIMARY KEY, title VARCHAR(255), text TEXT(1024), updated_at DATETIME)');
    tx.executeSql('CREATE TABLE ADS(id INTEGER PRIMARY KEY, name VARCHAR(255), percentage FLOAT, due_date DATETIME, banner VARCHAR(255), splash VARCHAR(255), updated_at DATETIME)');


    $.ajax({
        url: "http://www.festivall.eu/festivals.json?callback=?",
        //headers : {'Accept-Encoding' : 'gzip'},
        dataType:"json",
        success:function (changes) {
            if(changes['migration_version']!=localStorage["migration_version"] && localStorage["migration_version"] != undefined){

                localStorage.setItem("migration_version", changes['migration_version']);

                //populate db
                db.transaction(populateDB, errorCB, successCB);
                localStorage.setItem("firstRun", "true");
            }
            insertData(changes);
        },
        error: function() {
            errorInstallingDBCB();
        }
    });
}

function insertData(data){
    $.each(data, function(k,v){

        if(k=='migration_version' && v!=localStorage["migration_version"])
            localStorage.setItem("migration_version", v);

        if(k=='festivals'){
            db.transaction(function(tx){
                $.each(v, function(i, l){/*
                    console.log(k + 'VALUES (' + l.id + ', "' + l.name + '", ' + l.country_id + ', "' + l.coordinates +
                        ', "' + l.city + ', "' + l.logo + ', "' + l.map + ', "' + l.template + ', "' + l.tickets_price + ', "'
                        + l.tickets + ', "' + l.transports + ', "' + l.updated_at+')');*/
                    //download logo image
                    tx.executeSql('INSERT OR REPLACE INTO FESTIVALS (id, name, country_id, coordinates, city, logo, map,' +
                        ' template, tickets_price, tickets, transports, updated_at) VALUES (' + l.id +
                        ', "' + l.name + '", "' + l.country_id + '", "' + l.coordinates +'", "' + l.city + '", "' +
                        l.logo +'", "' + l.map + '", "' + l.template + '", "'+
                        l.tickets_price + '", "' + l.tickets + '", "' + l.transports + '", "' + l.updated_at +'")');

                }, errorCB);
            });
        }
        else if(k=='stages'){
            db.transaction(function(tx){
                $.each(v, function(i, l){

                    //console.log(k + 'VALUES (' + l.id + ', "' + l.name + '", ' + l.festival_id + ', "' + l.updated_at+')');
                    tx.executeSql('INSERT OR REPLACE INTO STAGES (id, name, festival_id, updated_at) VALUES (' + l.id +
                        ', "' + l.name + '", ' + l.festival_id + ', "' + l.updated_at +'")');
                });
            }, errorCB,  successCB);
        }

        else if(k=='days'){
            db.transaction(function(tx){
                $.each(v, function(i, l){
                    //console.log(k + 'VALUES (' + l.id + ', "' + l.festival_id + '", ' + l.date + ', "' + l.opening_time + ', "' + l.closing_time + ', "' + l.updated_at+')');
                    tx.executeSql('INSERT OR REPLACE INTO DAYS (id, festival_id, date, opening_time, closing_time, updated_at) VALUES (' + l.id +
                        ', ' + l.festival_id + ', "' + l.date + '", "' + l.opening_time + '", "' + l.closing_time + '", "' + l.updated_at +'")');
                });
            }, errorCB, successCB);
        }

        else if(k=='shows'){
            db.transaction(function(tx){
                $.each(v, function(i, l){
                    //alert(k + 'VALUES (' + l.id + ', "' + l.name + '", ' + l.festival_id + ', "' + l.stage_id + ', "' +
                      //  l.day_id + ', "' + l.photo + ', "' + l.description + ', "' + l.time + ', "' + l.updated_at+')');

                    tx.executeSql('INSERT OR REPLACE INTO SHOWS (id, name, festival_id, stage_id, day_id, photo, description, time, updated_at) VALUES (' + l.id +
                        ', "' + l.name + '", ' + l.festival_id + ', ' + l.stage_id + ', ' + l.day_id + ', "' + l.photo + '", "' + l.description +
                        '", "' + l.time + '", "' + l.updated_at + '")');
                });
            }, errorCB, successCB);
        }

        else if(k=='videos'){
            db.transaction(function(tx){
                $.each(v, function(i, l){
                    //console.log(k + 'VALUES (' + l.id + ', "' + l.name + ', "' + l.show_id + ', "' + l.url + ', "' + l.updated_at+')');
                    tx.executeSql('INSERT OR REPLACE INTO VIDEOS (id, name, show_id, url, updated_at) VALUES (' + l.id +
                        ', "' + l.name + '", ' + l.show_id + ', "' + l.url + '", "' + l.updated_at + '")');
                });
            }, errorCB, successCB);
        }

        else if(k=='about_us'){
            db.transaction(function(tx){
                $.each(v, function(i, l){
                    //console.log(k + 'VALUES (' + l.id + ', "' + l.title + ', "' + l.text + ', "' + l.updated_at+')');
                    tx.executeSql('INSERT OR REPLACE INTO ABOUT_US (id, title, text, updated_at) VALUES (' + l.id +
                        ', "' + l.title + '", "' + l.text + '", "' + l.updated_at + '")');
                });
            }, errorCB, successCB);
        }

        else if(k=='deleted_items'){ //end of synch
            db.transaction(function(tx){
            //último callback
                $.each(v, function(i, l){
                    console.log(k + 'VALUES (' + l.table.toString().toUpperCase() + ', "' + l.element +')');
                    tx.executeSql('DELETE FROM ' + l.table.toString().toUpperCase() +  ' WHERE id=' + l.element );
                });

            }, errorCB, successCB);
        }

        else if(k=='ads'){
            db.transaction(function(tx){
                $.each(v, function(i, l){
                    console.log(k + 'VALUES (' + l.id + ', "' + l.name + ', "' + l.percentage + ', "' + l.updated_at+')');
                    tx.executeSql('INSERT OR REPLACE INTO ADS (id, name, percentage, due_date, banner, splash, updated_at) VALUES (' + l.id +
                        ', "' + l.name + '", ' + l.percentage + ', "' + l.due_date + '", "' + l.banner + '", "' + l.splash +  '", "' + l.updated_at + '")');
                });
            }, errorCB, function(){
                updateLastSync();
            });
        }
    });
}



function updateLastSync() {
    db.transaction(
        function(tx) {
            var sql = "SELECT MAX(lastSync) as lastSync FROM("
                + "SELECT MAX(updated_at) as lastSync FROM FESTIVALS UNION ALL "
                + "SELECT MAX(updated_at) as lastSync FROM SHOWS UNION ALL "
                + "SELECT MAX(updated_at) as lastSync FROM DAYS UNION ALL "
                //+ "SELECT MAX(updated_at) as lastSync FROM PHOTOS UNION ALL "
                //+ "SELECT MAX(updated_at) as lastSync FROM USERS UNION ALL "
                //+ "SELECT MAX(updated_at) as lastSync FROM COMMENTS UNION ALL "
                + "SELECT MAX(updated_at) as lastSync FROM STAGES UNION ALL "
                //+ "SELECT MAX(updated_at) as lastSync FROM NOTIFICATIONS UNION ALL "
                //+ "SELECT MAX(updated_at) as lastSync FROM GALLERIES UNION ALL "
                + "SELECT MAX(updated_at) as lastSync FROM VIDEOS UNION ALL "
                + "SELECT MAX(updated_at) as lastSync FROM ABOUT_US UNION ALL "
            //+ "SELECT MAX(updated_at) as lastSync FROM COUNTRIES)";
                + "SELECT MAX(updated_at) as lastSync FROM ADS)";

            tx.executeSql(sql, [],
                function(tx, results) {
                    var last_sync = results.rows.item(0).lastSync;
                    console.log('UPDATING LASTSYNC WITH : ' + last_sync);
                    localStorage.setItem("lastSync", last_sync);
                }, errorQueryCB);
        }, errorCB, function(){//last step of synchronization
            if(localStorage['firstRun'] == 'true'){
                console.log('CREATING FESTIVALS');
                createFestivalsContainer();
            }
            createAds();
        }
    );
}

// Transaction success callback
function successCB(tx) {
    console.log("Transaction Success");
}

// Transaction error callback
function errorCB(err) {
    //alert("Error processing SQL: " + err + ", " + err.message + ", " + err.code);
    console.log("Error processing SQL: " + err.code + " : " + err.message);
}

function errorQueryCB(tx, err){
    //alert("Error processing SQL query: " + err + ", " + err.message + ", " + err.code);
    console.log("Error processing SQL query: " + err.code + " : " + err.message);
}

function errorInstallingDBCB(){
    if(localStorage["firstRun"] == undefined || localStorage["firstRun"] == "true"){
        window.FestivallToaster.showMessage('Precisas de Internet para sacares a base de dados!');
        navigator.app.exitApp();
    }
    window.FestivallToaster.showMessage("Não há conexão com a internet!");
    createAds();

}