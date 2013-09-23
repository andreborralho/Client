var menuIsUp = false;
var history_array = [];
var screen_width;

/*//Loading
function initDisplays(){
    //set screen width and height according to device
    setHeightAndWidth();
    //$('#loaderSplash').addClass("visible_splash");
}*/

function setHeightAndWidth(){
    var screen_height = window.innerHeight;
    screen_width = window.innerWidth;
    $('.swipe_bar_list').css('min-width', screen_width + 'px');
    $('body').css('height', screen_height + 'px').css('width', screen_width + 'px');
}

function initFestivalsDisplay(){
    //$('#loaderSplash').removeClass("visible_splash");

    var container_height = $('#header').height()-2 + "px";
    $('#header').css('height', container_height);
    $('#festivals').addClass('visible');
}


//Navigation
function changeContainers(page, title, subtitle){
    var header_title_selector = $('#header_title');

    $('.container').removeClass('visible visible_with_ads');

    var networkState = navigator.connection.type;
    console.log('checking if it should create add : ads.length - ' + ads.length + ', net - ' + networkState);
    $(page).addClass("visible");
    if(ads.length > 0 && networkState != Connection.NONE){
        $(page).addClass("visible_with_ads");
        console.log('showing ad');
        showBannerAd();
    }


    incrementHistory(page);

    if(page == "#festivals"){
        header_title_selector.removeClass('heading1').addClass('heading0');
        header_title_selector.html('<img id="logo" alt="FestivAll" src="img/logo.png"> FestivAll');
        $('#header_subtitle').empty();
        $('#header_link').unbind();
    }
    else if(page == "#before_festival"){
        $('#header_subtitle').empty();
        header_title_selector.removeClass('heading0').addClass('heading1');

        if(title == undefined)
            header_title_selector.text(current_festival_name);
        else
            header_title_selector.text(title);
    }
    else if(page == "#during_festival"){
        $('#header_subtitle').empty();
        header_title_selector.removeClass('heading0').addClass('heading1');

        if(title == undefined)
            header_title_selector.text(current_festival_name);
        else
            header_title_selector.text(title);
    }
    else if(page == "#shows"){
        $('#header_subtitle').text("Bandas");
        header_title_selector.removeClass('heading0').addClass('heading1');

        if(title == undefined)
            header_title_selector.text(current_festival_name);
        else
            header_title_selector.text(title);
    }
    else if(page == "#lineup"){
        $('#header_subtitle').text("Cartaz");
        header_title_selector.removeClass('heading0').addClass('heading1');

        if(title == undefined)
            header_title_selector.text(current_festival_name);
        else
            header_title_selector.text(title);

        //createPagingSwipeBar(current_linup_page, lineup_nav_items);
    }
    else if(page =="#feedback"){
        header_title_selector.removeClass('heading0').addClass('heading1').empty().text("Menu");
        $('#header_subtitle').text("Feedback");
    }
    else if(page =="#about_us"){
        header_title_selector.removeClass('heading0').addClass('heading1').empty().text("Menu");
        $('#header_subtitle').text("Quem somos");
    }
    else if(page =="#search"){
        header_title_selector.removeClass('heading0').addClass('heading1').empty().text("Menu");
        $('#header_subtitle').text("Pesquisa");
    }

    else if(page =="#search_results"){
        header_title_selector.removeClass('heading0').addClass('heading1').empty().text(search_token);
        $('#header_subtitle').text("Resultados da Pesquisa");

    }
    else{
        header_title_selector.removeClass('heading0').addClass('heading1').text(title);
        $('#header_subtitle').text(subtitle);
    }
}

function backButton(){
    if(menuIsUp){
        menuIsUp = false;
        $('#menu').removeClass('active_menu');
    }
    else{
        history_array.pop();
        var history_popped = history_array.pop();

        if(history_popped == undefined)
            navigator.app.exitApp();
        else
            changeContainers(history_popped);
    }
}

function incrementHistory(page){
    history_array.push(page);
}

function fixHeaderLink(page){
    var history_popped = history_array.pop();
    while(history_popped != page){
        history_popped = history_array.pop();
    }
}

// process the confirmation dialog result
function onConfirm(button) {
    if(button==2)
        navigator.app.exitApp();
}
// Show a custom confirmation dialog
function confirmExit() {
    navigator.notification.confirm(
        'Queres mesmo sair?', // message
        onConfirm, // callback to invoke with index of button pressed
        'Sair', // title
        'Voltar,Sair' // buttonLabels
    );
}

function bindClickToNavBar(nav_items, carousel){
    var nav_item = "";

    //nav width
    var swipe_bar_list = $('.swipe_bar_list');
    var nav_width = swipe_bar_list.width() / 2;

    for(var i=0; i<nav_items.length; i++){
        nav_item = nav_items[i];

        (function (i, nav_item, nav_items, carousel){
            $(nav_item).unbind().bind('click', function(){
                swipe_bar_list.find('a').removeClass('current');
                $(nav_items[i]).addClass('current');

                if(i == 0)
                    swipe_bar_list.removeClass('middle last').addClass('first');
                else if(i == nav_items.length -1)
                    swipe_bar_list.removeClass('first middle').addClass('last');
                else
                    swipe_bar_list.removeClass('first last').addClass('middle').css('margin-left', '-' + nav_width + 'px');

                carousel.onMoveIndex(i, 200);
            });
        })(i, nav_item, nav_items, carousel);
    }
}


// paging_function do swipebar
function createPagingSwipeBar(index, nav_items){

    //nav width
    var swipe_bar_list = $('.swipe_bar_list');
    var nav_width = swipe_bar_list.width() / 2;
    swipe_bar_list.find('a').removeClass('current');

    if(index == 0){
        $(nav_items[index]).addClass('current');
        swipe_bar_list.removeClass('middle last').addClass('first');
    }
    else if(index == nav_items.length -1){
        $(nav_items[index]).addClass('current');
        swipe_bar_list.removeClass('first middle').addClass('last');
    }
    else{
        $(nav_items[index]).addClass('current');
        swipe_bar_list.removeClass('first last').addClass('middle').css('margin-left', '-' + nav_width + 'px');
    }
}