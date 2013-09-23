// MAP_CONTAINER


// Queries the local Database for a map
function createMapContainer(festival) {

    $('#header_link').unbind().bind('click', function(){
        createFestivalContainer(current_festival_id);
        fixHeaderLink('#'+festival_container+'_festival');
    });

    var filename = festival.name + '_map.jpg';
    var file_path = 'file:///data/data/com.festivall_new/FestivAll/'  + filename;
    var hasMap = localStorage[filename];
    console.log('MAP EXISTS ? ' + hasMap);
    if(hasMap!= undefined){
        var dummy = makeid();
        $('#map_page').empty().append('<div id="map_scroll_wrapper" class="scroll_wrapper"><div>');
        $('#map_scroll_wrapper').append('' +
            '<div id="map_scroller">' +
                '<img alt="Mapa" src="' + file_path + '?dummy=' + dummy + '">' +
            '</div>');
        $('#map_scroller').scroller({
            verticalScroll:true,
            horizontalScroll:true
        });
    }else{
        $('#map_page').empty().append( '<div id="no_map" class="padded"><p>Mapa ainda não disponível.</p></div>');
    }



}
