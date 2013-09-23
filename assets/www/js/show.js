// SHOW_CONTAINER


// Queries the local Database for a show
function createShowContainer(show_id){

    db.transaction(function (tx) {
        tx.executeSql('SELECT SHOWS.*, STAGES.NAME AS stage_name, DAYS.DATE AS day_date,' +
            ' FESTIVALS.ID AS festival_id, FESTIVALS.NAME AS festival_name' +
            ' FROM SHOWS INNER JOIN STAGES ON SHOWS.STAGE_ID = STAGES.ID INNER JOIN DAYS ON SHOWS.DAY_ID = DAYS.ID' +
            ' INNER JOIN FESTIVALS ON SHOWS.FESTIVAL_ID = FESTIVALS.ID' +
            ' WHERE SHOWS.ID='+show_id, [], queryShowSuccess, errorQueryCB);

        tx.executeSql('SELECT * FROM VIDEOS WHERE SHOW_ID='+show_id, [], queryShowVideosSuccess, errorQueryCB);
    }, errorCB);
}

// Success callback for the the query of one festival
function queryShowSuccess(tx, results) {

    $('#show_carousel').remove();
    $('#show').append('' +
        '<div id="show_carousel" class="carousel" data-role="carousel">' +
            '<div id="show_page" class="page" data-role="page">' +
                '<div id="show_scroll_wrapper" class="scroll_wrapper">' +
                    '<div id="show_scroller">' +
                        '<div id="show_photo">' +
                            '<img width="100%" src="img/placeholder.png">' +
                        '</div>' +
                        '<div class="padded">' +
                            '<ul>' +
                                '<li id="show_stage"></li>' +
                                '<li>' +
                                    '<span id="show_date"></span> |' +
                                    '<span id="show_time"></span>' +
                                '</li>' +
                            '</ul>' +
                            '<br>' +
                            '<p class="content_text" id="show_description"></p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div id="band_videos_page" class="page" data-role="page">' +
                '<div id="band_video_wrapper" class="scroll_wrapper">' +
                    '<div id="band_videos_scroller"></div>' +
                '</div>' +
            '</div>' +
        '</div>');

    var show = results.rows.item(0);
    current_festival_id = show.festival_id;


    $('#header_link').unbind().bind('click', function(){
        createFestivalContainer(show.festival_id);
        fixHeaderLink('#' + festival_container + '_festival');
    });

    var show_day = show.day_date.slice(8,10);
    var numeric_month = show.day_date.slice(5,7);
    var show_month = changeNumberToMonth(numeric_month);

    $('#header_subtitle').text(show.festival_name);

    if(show.photo != "null" && show.photo != "")
        $('#show_photo').html('<img width="100%" src="' + show.photo + '">');

    $('#show_stage').text(show.stage_name);

    if(show_day == "01" && show_month == "Janeiro")
        $('#show_date').text("Dia por confirmar");
    else
        $('#show_date').text(show_day + " de " + show_month);

    var show_time = show.time.slice(11,16);
    if(show_time != "00:01")
        $('#show_time').text(show_time);
    else
        $('#show_time').text("Hora não disponível");

    if(show.description == "null")
        $('#show_description').html("Descrição da banda ainda não disponível.");
    else{
        var description_html_tags = show.description.replace(/\r\n/g, "<br>");
        $('#show_description').html(description_html_tags);
    }

    $('#show_scroller').scroller();
}
