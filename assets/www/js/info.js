// INFO_CONTAINER

function init_info_carousel(){

    // Inits carousel for info_container
    var info_carousel = $('#info_carousel').carousel({
        preventDefaults:false,
        pagingFunction:function(index){
            createPagingSwipeBar(index, ['#tickets_nav_item','#transports_nav_item','#weather_nav_item']);
        }
    });

    bindClickToNavBar(['#tickets_nav_item','#transports_nav_item','#weather_nav_item'], info_carousel);
}

// Queries the local Database for a show
function createInfoContainer(festival_id){

    $('#header_link').unbind().bind('click', function(){
        createFestivalContainer(festival_id);
        fixHeaderLink('#'+ festival_container +'_festival');
    });

    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM FESTIVALS WHERE ID='+festival_id, [], queryInfoSuccess, errorCB);
    }, errorCB);

    $('.swipe_bar_list').removeClass('middle last').addClass('first');
    $('#tickets_nav_item').addClass('current');
    $('#transports_nav_item').removeClass('current');
    $('#weather_nav_item').removeClass('current');
}

// Success callback for the the query info of one festival
function queryInfoSuccess(tx, results) {
    $('#info_carousel').remove();
    $('#info').append('' +
        '<div id="info_carousel" class="carousel" data-role="carousel">' +

            '<div id="tickets_page" class="page" data-role="page">' +
                '<div id="tickets_wrapper" class="scroll_wrapper">' +
                    '<div id="tickets_scroller" class="padded"></div>' +
                '</div>' +
            '</div>' +

            '<div id="transports_page" class="page" data-role="page">' +
                '<div id=transports_wrapper class="scroll_wrapper">' +
                    '<div id="transports_scroller" class="padded"></div>' +
                '</div>' +
            '</div>' +

            '<div id="weather_page" class="page" data-role="page">' +
                '<div id="weather_wrapper" class="scroll_wrapper">' +

                    '<div id="weather_scroller"></div>' +

                '</div>' +
            '</div>' +
        '</div>');


    var festival = results.rows.item(0);
    var coordinates = festival.coordinates;
    coordinates = coordinates.split(" ");

    var latitude = coordinates[0];
    var longitude = coordinates[1];

    var tickets_html_tags = festival.tickets.replace(/\r\n/g, "<br>");

    $('#tickets_scroller').html(tickets_html_tags);
    $('#tickets_scroller').scroller();

    var transports_html_tags = festival.transports.replace(/\r\n/g, "<br>");
    $('#transports_scroller').html(transports_html_tags);
    $('#transports_scroller').scroller();


    $.ajax({
        url: 'http://free.worldweatheronline.com/feed/weather.ashx?q='+ latitude +',' + longitude +
            '&format=json&num_of_days=5&key=553a8863c6144236131203',
        dataType:'application/json',
        contentType:'application/json',
        timeout: 3000,
        success:function (data) {
            data = JSON.parse(data);
            $.each(data, function(k,v){
                $.each(v, function(weather_key, weather_value){
                    if(weather_key=="current_condition"){
                        $('#weather_scroller').append(
                            '<div id="weather_current">' +
                                '<div class="row">' +
                                    '<div class="column centered">' +
                                        '<img src="" id="weather_img_current">' +
                                        '<span id="weather_temperature_current"></span>' +
                                    '</div>' +
                                '</div>' +
                                '<p id="weather_description_current" class="row"></p>' +
                            '</div>' +
                            '<ul id="weather_list" class="list" style="width:100%"></ul>'
                        );

                        $.each(weather_value[0], function(temperature_key, temperature_value){
                            if(temperature_key=="temp_C"){
                                $('#weather_temperature_current').empty();
                                $('#weather_temperature_current').text(temperature_value + " ºC");
                            }

                            else if(temperature_key=="weatherDesc"){
                                var weather_description_selector = $('#weather_description_current');
                                $.each(temperature_value[0], function(desc_key, desc_value){
                                    weather_description_selector.html(translateWeatherDescription(desc_value)+'<div id="weather_city">Agora em '+festival.city+'</div>');
                                });
                            }
                            else if(temperature_key=="weatherIconUrl"){
                                $.each(temperature_value[0], function(icon_key, icon_value){
                                    icon_changed = changeWeatherIcon(icon_value);
                                    $('#weather_img_current').attr('src', icon_changed);
                                });
                            }
                        });
                    }
                    var day_index, weather_day, numeric_month, weather_month, week_day, icon_changed;
                    if(weather_key=="weather"){
                        $.each(weather_value, function(day_key, day_value){
                            day_index = day_key +1;
                            $('#weather_list').append('' +
                                '<li id="weather_day' + day_index +'" class="row">' +
                                    '<div class="column centered">' +
                                        '<strong id="weather_weekday' + day_index +'" class="weather_weekday"></strong><br>' +
                                        '<span id="weather_date' + day_index +'" class="weather_date"></span>' +
                                    '</div>' +
                                    '<div class="column no_padding">' +
                                        '<img src="" id="weather_img' + day_index +'" class="weather_icon">' +
                                    '</div>' +
                                    '<div class="column weather_description">' +
                                        '<p id="weather_description' + day_index +'"></p>' +
                                    '</div>' +
                                    '<div class="column weather_temperature">' +
                                        '<span id="weather_max_temperature' + day_index +'" class="max"></span>' +
                                        '<span id="weather_min_temperature' + day_index +'" class="min"></span>' +
                                    '</div>' +
                                '</li>'
                            );

                            $.each(day_value, function(temperature_key, temperature_value){
                                if(temperature_key=="date"){
                                    weather_day = temperature_value.slice(8,10);
                                    numeric_month = temperature_value.slice(5,7);
                                    weather_month = changeNumberToMonthAbrev(numeric_month);
                                    week_day = new Date(2013, numeric_month-1, weather_day);
                                    $('#weather_weekday'+day_index).text(numberToWeekDay(week_day.getDay()));
                                    $('#weather_date'+day_index).text(weather_day + " " + weather_month);
                                }
                                else if(temperature_key=="tempMaxC"){
                                    $('#weather_max_temperature'+day_index).text(temperature_value + "°");
                                }
                                else if(temperature_key=="tempMinC"){
                                    $('#weather_min_temperature'+day_index).text(temperature_value + "°");
                                }
                                else if(temperature_key=="weatherDesc"){
                                    $.each(temperature_value[0], function(desc_key, desc_value){
                                        description_changed = translateWeatherDescription(desc_value);
                                        $('#weather_description'+day_index).html(description_changed);
                                    });
                                }
                                else if(temperature_key=="weatherIconUrl"){
                                    $.each(temperature_value[0], function(icon_key, icon_value){
                                        icon_changed = changeWeatherIcon(icon_value);
                                        $('#weather_img'+day_index).attr('src', icon_changed);
                                    });
                                }
                            });
                        });
                    }
                });
            });
            init_info_carousel();
        },
        error: function(model, response){
            $('#weather_scroller').append('' +
                '<div class="padded weather_offline">' +
                    '<p>É preciso estares ligado à internet para se obter a informação do tempo.</p>' +
                '</div>');
            init_info_carousel();
        }
    });

    $('#weather_scroller').scroller();

}


function numberToWeekDay(weekday_number){
    var week_day;

    switch(weekday_number){
        case 0:
            week_day = "Dom";
            break;
        case 1:
            week_day = "Seg";
            break;
        case 2:
            week_day = "Ter";
            break;
        case 3:
            week_day = "Qua";
            break;
        case 4:
            week_day = "Qui";
            break;
        case 5:
            week_day = "Sex";
            break;
        case 6:
            week_day = "Sáb";
            break;
    }
    return week_day;
}

function translateWeatherDescription(desc_value){

    switch (desc_value){
        case "Moderate or heavy snow in area with thunder":
            desc_value = "Nevões fortes<br> e trovoada";
            break;
        case "Patchy light snow in area with thunder":
            desc_value = "Nevões fracos<br> e trovoada";
            break;
        case "Moderate or heavy rain in area with thunder":
            desc_value = "Chuva forte<br> e trovoada";
            break;
        case "Patchy light rain in area with thunder":
            desc_value = "Chuva fraca<br> e trovoada";
            break;
        case "Moderate or heavy showers of ice pellets":
            desc_value = "Chuva forte<br> com granizo";
            break;
        case "Light showers of ice pellets":
            desc_value = "Chuva fraca<br> com granizo";
            break;
        case "Light sleet showers":
            desc_value = "Chuva fraca<br> com granizo";
            break;
        case "Light snow showers":
            desc_value = "Nevões fracos";
            break;
        case "Moderate or heavy sleet showers":
            desc_value = "Chuva<br> com granizo";
            break;
        case "Torrential rain shower":
            desc_value = "Chuva torrencial";
            break;
        case "Moderate or heavy rain shower":
            desc_value = "Chuva forte<br> ou moderada";
            break;
        case "Light rain shower":
            desc_value = "Chuva fraca";
            break;
        case "Ice pellets":
            desc_value = "Granizo";
            break;
        case "Heavy snow":
            desc_value = "Nevões forte";
            break;
        case "Patchy heavy snow":
            desc_value = "Nevões fortes";
            break;
        case "Moderate snow":
            desc_value = "Neve moderada";
            break;
        case "Patchy moderate snow":
            desc_value = "Neve moderada";
            break;
        case "Light snow":
            desc_value = "Queda fraca<br> de neve";
            break;
        case "Patchy light snow":
            desc_value = "Queda fraca<br> de neve";
            break;
        case "Moderate or heavy sleet":
            desc_value = "Chuva de granizo<br> moderada";
            break;
        case "Light sleet":
            desc_value = "Chuva fraca";
            break;
        case "Moderate or Heavy freezing rain":
            desc_value = "Chuva forte<br> ou moderada";
            break;
        case "Light freezing rain":
            desc_value = "Chuva fraca";
            break;
        case "Heavy rain":
            desc_value = "Chuva forte";
            break;
        case "Heavy rain at times":
            desc_value = "Períodos de<br> chuva forte";
            break;
        case "Moderate rain":
            desc_value = "Chuva moderada";
            break;
        case "Moderate rain at times":
            desc_value = "Períodos de<br> chuva moderada";
            break;
        case "Light rain":
            desc_value = "Chuva fraca";
            break;
        case "Patchy light rain":
            desc_value = "Chuva fraca";
            break;
        case "Heavy freezing drizzle":
            desc_value = "Chuviscos fortes";
            break;
        case "Freezing drizzle":
            desc_value = "Chuviscos";
            break;
        case "Light drizzle":
            desc_value = "Chuviscos fracos";
            break;
        case "Patchy light drizzle":
            desc_value = "Chuviscos fracos";
            break;
        case "Freezing fog":
            desc_value = "Nevoeiro";
            break;
        case "Fog":
            desc_value = "Nevoeiro";
            break;
        case "Blizzard":
            desc_value = "Tempestade<br> de neve";
            break;
        case "Blowing snow":
            desc_value = "Neve";
            break;
        case "Thundery outbreaks in nearby":
            desc_value = "Tempestade";
            break;
        case "Patchy freezing drizzle nearby":
            desc_value = "Chuviscos";
            break;
        case "Patchy sleet nearby":
            desc_value = "Granizo";
            break;
        case "Patchy snow nearby":
            desc_value = "Neve";
            break;
        case "Patchy rain nearby":
            desc_value = "Chuva";
            break;
        case "Mist":
            desc_value = "Neblina";
            break;
        case "Overcast":
            desc_value = "Céu nublado";
            break;
        case "Cloudy":
            desc_value = "Céu nublado";
            break;
        case "Partly Cloudy":
            desc_value = "Céu pouco<br> nublado";
            break;
        case "Clear":
            desc_value = "Céu limpo";
            break;
        case "Sunny":
            desc_value = "Céu limpo";
            break;
    }
    return desc_value;
}

function changeWeatherIcon(weather_icon_url){
    var weather_icon;
    weather_icon_url = weather_icon_url.split('/');
    var weather_icon_url_splited = weather_icon_url[weather_icon_url.length -1];

    switch(weather_icon_url_splited){
        case "wsymbol_0001_sunny.png":
            weather_icon = "img/weather/sunny.png";
            break;
        case "wsymbol_0002_sunny_intervals.png":
            weather_icon = "img/weather/cloudy1.png";
            break;
        case "wsymbol_0003_white_cloud.png":
            weather_icon = "img/weather/cloudy5.png";
            break;
        case "wsymbol_0004_black_low_cloud.png":
            weather_icon = "img/weather/overcast.png";
            break;
        case "wsymbol_0006_mist.png":
            weather_icon = "img/weather/mist.png";
            break;
        case "wsymbol_0007_fog.png":
            weather_icon = "img/weather/fog.png";
            break;
        case "wsymbol_0008_clear_sky_night.png":
            weather_icon = "img/weather/sunny_night.png";
            break;
        case "wsymbol_0009_light_rain_showers.png":
            weather_icon = "img/weather/light_rain.png";
            break;
        case "wsymbol_0010_heavy_rain_showers.png":
            weather_icon = "img/weather/shower3.png";
            break;
        case "wsymbol_0011_light_snow_showers.png":
            weather_icon = "img/weather/snow2.png";
            break;
        case "wsymbol_0012_heavy_snow_showers.png":
            weather_icon = "img/weather/snow4.png";
            break;
        case "wsymbol_0013_sleet_showers.png":
            weather_icon = "img/weather/sleet.png";
            break;
        case "wsymbol_0016_thundery_showers.png":
            weather_icon = "img/weather/tstorm1.png";
            break;
        case "wsymbol_0017_cloudy_with_light_rain.png":
            weather_icon = "img/weather/light_rain.png";
            break;
        case "wsymbol_0018_cloudy_with_heavy_rain.png":
            weather_icon = "img/weather/shower3.png";
            break;
        case "wsymbol_0019_cloudy_with_light_snow.png":
            weather_icon = "img/weather/snow1.png";
            break;
        case "wsymbol_0020_cloudy_with_heavy_snow.png":
            weather_icon = "img/weather/snow4.png";
            break;
        case "wsymbol_0021_cloudy_with_sleet.png":
            weather_icon = "img/weather/sleet.png";
            break;
        case "wsymbol_0024_thunderstorms.png":
            weather_icon = "img/weather/tstorm3.png";
            break;
        case "wsymbol_0025_light_rain_showers_night.png":
            weather_icon = "img/weather/shower1_night.png";
            break;
        case "wsymbol_0026_heavy_rain_showers_night.png":
            weather_icon = "img/weather/shower2_night.png";
            break;
        case "wsymbol_0027_light_snow_showers_night.png":
            weather_icon = "img/weather/snow1_night.png";
            break;
        case "wsymbol_0028_heavy_snow_showers_night.png":
            weather_icon = "img/weather/snow3_night.png";
            break;
        case "wsymbol_0029_sleet_showers_night.png":
            weather_icon = "img/weather/sleet.png";
            break;
        case "wsymbol_0032_thundery_showers_night.png":
            weather_icon = "img/weather/tstorm1_night.png";
            break;
        case "wsymbol_0033_cloudy_with_light_rain_night.png":
            weather_icon = "img/weather/shower1_night.png";
            break;
        case "wsymbol_0034_cloudy_with_heavy_rain_night.png":
            weather_icon = "img/weather/shower2_night.png";
            break;
        case "wsymbol_0035_cloudy_with_light_snow_night.png":
            weather_icon = "img/weather/snow1_night.png";
            break;
        case "wsymbol_0036_cloudy_with_heavy_snow_night.png":
            weather_icon = "img/weather/snow3_night.png";
            break;
        case "wsymbol_0037_cloudy_with_sleet_night.png":
            weather_icon = "img/weather/sleet.png";
            break;
        case "wsymbol_0040_thunderstorms_night.png":
            weather_icon = "img/weather/tstorm2_night.png";
            break;
    }
    return weather_icon;
}
