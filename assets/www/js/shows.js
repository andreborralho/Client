// SHOWS_CONTAINER

function createShowsContainer(festival_id){

    db.transaction(function (tx){
        tx.executeSql('SELECT SHOWS.*, STAGES.NAME AS stage_name, DAYS.DATE AS day_date ' +
            'FROM SHOWS INNER JOIN STAGES ON STAGES.ID = SHOWS.STAGE_ID INNER JOIN DAYS ON DAYS.ID = SHOWS.DAY_ID ' +
            'WHERE SHOWS.FESTIVAL_ID='+festival_id +' ORDER BY SHOWS.NAME', [], queryShowsSuccess, errorQueryCB);
    }, errorCB);
}

// Success callback for the query all the shows of one festival
function queryShowsSuccess(tx, results) {

    var shows = results.rows;
	var len = shows.length;
    var show, show_id, show_time;
    var show_name_letter, show_name_previous_letter, numeric_month, show_day, month;
    $('#shows_page_list').empty();


    $('#header_link').unbind().bind('click', function(){
        createFestivalContainer(current_festival_id);
        fixHeaderLink('#'+festival_container+'_festival');
    });

    if (len >0 ){

        for (var i=0; i<len; i++){
            show = shows.item(i);
            show_id = shows.item(i).id;
            show_time = show.time.slice(11,16);
            numeric_month = show.day_date.slice(5,7);
            show_name_letter = show.name.slice(0,1);

            month = changeNumberToMonthAbrev(numeric_month);
            show_day = show.day_date.slice(8,10);

            if(show_name_letter != show_name_previous_letter){
                $('#shows_page_list').append('<li id="show_letter_' + show_name_letter +'"></li>');

                $('#show_letter_' + show_name_letter).append(
                    '<header class="list_header row"><span>' + show_name_letter + '</span></header>' +
                    '<ul id="show_list_letter_' + show_name_letter +'" class="list"></ul>');
            }

            //if(show_time != "00:01")
                $('#show_list_letter_'+show_name_letter).append(
                    '<li id="show_' + show_id + '" class="row">' +
                        '<div class="column fixed bdr_r">' +
                            '<span class="show_date">' + show_day + " " + month + '</span>' +
                            '<span class="show_time">' + show_time + '</span>' +
                        '</div>' +
                        '<div class="column">' +
                            '<h3 class="band_name">' + show.name + '</h3>' +
                            '<p class="stage_name">' + show.stage_name + '</p>' +
                        '</div>' +
                    '</li>'
                /* +
                    '<div class="column fixed bdr_l">' +
                        '<span>%</span>' +
                    '</div>'*/
                );
            /*else
                $('#show_list_letter_'+show_name_letter).append(
                    '<li id="show_' + show_id + '" class="row">' +
                        '<div class="column fixed bdr_r">' +
                        '<span class="show_date">' + show.day_date.slice(8,10) + " " + month + '</span>' +
                        '<span class="show_time">--:--</span>' +
                        '</div>' +
                        '<div class="column">' +
                        '<h3 class="band_name">' + show.name + '</h3>' +
                        '<p class="stage_name">' + show.stage_name + '</p>' +
                        '</div>' +
                        '</li>'
                    *//* +
                     '<div class="column fixed bdr_l">' +
                     '<span>%</span>' +
                     '</div>'*//*
                );*/

            if(show_time == "00:01")
                $('#show_'+show_id + ' .show_time').text("--:--");
            if(show_day == "01" && month == "Jan")
                $('#show_'+show_id + ' .show_date').text("TBA");

            (function (show_name){
                $('#show_'+show_id).unbind().bind('click', function(){
                    createShowContainer(this.id.replace("show_", ""));
                    changeContainers("#show", show_name, current_festival_name);
                });
            })(show.name);

            show_name_previous_letter = show_name_letter;
        }

        new IScroll('#shows_scroll_wrapper');

    }else
        $('#shows_page_list').append('<div class="padded"><p>Ainda não há bandas para este festival!</p></div>');
}

function changeNumberToMonthAbrev(numeric_month){
    var month;
    switch(numeric_month){
        case "01":
            month = "Jan";
            break;
        case "02":
            month = "Fev";
            break;
        case "03":
            month = "Mar";
            break;
        case "04":
            month = "Abr";
            break;
        case "05":
            month = "Mai";
            break;
        case "06":
            month = "Jun";
            break;
        case "07":
            month = "Jul";
            break;
        case "08":
            month = "Ago";
            break;
        case "09":
            month = "Set";
            break;
        case "10":
            month = "Out";
            break;
        case "11":
            month = "Nov";
            break;
        case "12":
            month = "Dez";
            break;
    }
    return month;
}