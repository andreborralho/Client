// FESTIVALS_CONTAINER


// Queries the local Database for all festivals
function createFestivalsContainer(){
    db.transaction(function queryFestivals(tx) {
        console.log('QUERYING FESTIVALS :');

        tx.executeSql('SELECT FESTIVALS.*, MIN(DAYS.date) as first_day ' +
                        'FROM DAYS INNER JOIN FESTIVALS ' +
                        'ON FESTIVALS.id = DAYS.festival_id ' +
                        'GROUP BY DAYS.festival_id ' +
                        'ORDER BY first_day', [], queryFestivalsSuccess, errorQueryCB);
                }, errorCB, successCB);
}



// Callback for the festivals query
function queryFestivalsSuccess(tx, results) {

    //Create festivals container after insertions
    if(localStorage["firstRun"] == "true"){
        window.FestivallToaster.showMessage('Base de dados criada!');
        initFestivalsDisplay();
        localStorage.setItem("firstRun", "false");
        $('#installer').removeClass('visible');
        console.log('INITIALIZING DISPLAY :');
        createAppDir('FestivAll'); //creates the directory for the local storage files
    }
    incrementHistory("#festivals");
    $('#festivals_buttons').empty();

    var len = results.rows.length;
    var festivals = results.rows;
    console.log('FESTIVALS LENGTH :' + len);
    var ended_festivals = [];
    for (var i=0; i<len; i++){

        var festival = festivals.item(i);
        var festival_id = festival.id;
        checkIfAfterFestival(festival.id, ended_festivals, i, len);
    }
}

function checkIfAfterFestival(festival_id, ended_festivals, i, len){
    var current_time = new Date().getTime();
    db.transaction(function (tx) {
        tx.executeSql('SELECT *, FESTIVALS.id AS id, DAYS.id as day_id ' +
            'FROM FESTIVALS INNER JOIN DAYS ON FESTIVALS.ID = DAYS.FESTIVAL_ID ' +
            'WHERE FESTIVALS.ID='+festival_id, [], function(tx,results){
            var closing_time = getLastDayClosingTime(results.rows);
            var festival = results.rows.item(0);
            if (current_time > closing_time){
                ended_festivals.push(festival);
            }else{
                addFestivalToList(festival, i, len);
            }
            //add ended festivals and scroller
            if(i >= len-1){
                //meter linha
                $('#festivals_buttons').append('<br><div class="festivals_line_break">Terminados</div>');
                for(var j = 0; j <ended_festivals.length; j++){
                    addFestivalToList(ended_festivals[j], i, len);
                }
                //$('#festivals_buttons').scroller();
                console.log('FESTIVALS: INITIALIZING SCROLLER :');
                festivals_scroller = new IScroll('#festivals_scroll_wrapper');


            }
        }, errorQueryCB);
    }, errorCB, successCB);

}

function addFestivalToList(festival, i, len){


    $('#festivals_buttons').append('' +
        '<li id="festival_' + festival.id +'" class="item">' +
            '<a href="#"><img class="festival_logo" src=""></a>' +
        '</li>');

    $('#festival_'+festival.id).unbind().bind('click', function(){
        createFestivalContainer(this.id.replace("festival_", ""));
    });


    //Check if the logo file exists
    var filename = 'FestivAll/' + festival.name + '.jpg';
    var hasLogo = localStorage[festival.name];
    var file_path = 'file:///data/data/com.festivall_new/'  + filename;
    var url = festival.logo;
    //Ajax call to download logo if it is not stored
    if(hasLogo == undefined)
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
            fileSystem.root.getFile(filename, {create: true, exclusive: false}, function (fileEntry) {});
        });
    if(hasLogo == undefined || festival.logo != hasLogo){//Might not sync correctly first time because of lag in syncronization
        var fileTransfer = new FileTransfer();
        fileTransfer.download(
            url,
            file_path,
            function(entry) {
                console.log('SUCCESS DOWNLOAD LOGO FROM ' + festival.name + ', URL:' + url);
                localStorage[festival.name] = url;
                addLogo(festival, file_path);  //Reads from the file
            },
            function(error) {
                console.log('ERROR LOGO FROM ' + festival.name + 'FAIL, URL:' + url);
                if(hasLogo != undefined)
                    addLogo(festival, file_path);
            }
        );
    }
    else{  //Reads from the file
        addLogo(festival, file_path);
    }
    //Cache the map of the festival
    cacheMap(festival);

}

//fail reading
function fail(evt) {
    console.log(' 000.ERROR : ' + evt.target.error.code);
}

function addLogo(festival, file_path){
    var dummy = makeid();
    console.log('FETCHING LOGO :' + file_path);
    $('#festival_' + festival.id ).empty().append('<a href="#"><img class="festival_logo" src="' + file_path + '?dummy=' + dummy + '"></a>');;
}


function makeid(){
    var text = "";
    var possible = "0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function cacheMap(festival){
    //Check if the logo file exists
    var filename = 'FestivAll/' + festival.name + '_map.jpg';
    var hasMap = localStorage[festival.name + '_map.jpg'];
    console.log('CHECKING MAP: old map :' + hasMap + ', festival.map : ' + festival.map);
    var file_path = 'file:///data/data/com.festivall_new/'  + filename;
    var url = festival.map;
    //Ajax call to download logo if it is not stored
    if(hasMap == undefined )
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
            fileSystem.root.getFile(filename, {create: true, exclusive: false}, function (fileEntry) {});
        });

    if(festival.map != hasMap || hasMap == undefined ){
        var fileTransfer = new FileTransfer();
        fileTransfer.download(
            url,
            file_path,
            function(entry) {
                console.log('SUCCESS DOWNLOAD MAP FROM ' + festival.name + ', URL:' + url);
                localStorage[festival.name + '_map.jpg'] = url;
            },
            function(error) {
                console.log('ERROR MAP FROM ' + festival.name + ' FAIL, URL:' + url);
            }
        );
    }
}

function createAppDir(filename){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
            var entry=fileSystem.root;
            entry.getDirectory(filename, {create: true, exclusive: false}, onGetDirectorySuccess, onGetDirectoryFail);
        } , null);


    function onGetDirectorySuccess(dir) {
        console.log("Created dir "+dir.name);
    }

    function onGetDirectoryFail(error) {
        console.log("Error creating directory "+error.code);
    }
}