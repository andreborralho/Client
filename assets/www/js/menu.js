//Menu button callback
function menuButton(e){
    if(!menuIsUp){
        menuIsUp = true;
        createMenuContainer();
    }
    else{
        menuIsUp = false;
        $('#menu').removeClass('active_menu');
    }
}

function searchButton(){
    menuIsUp=false;
    createSearchContainer();
    $('#menu').removeClass('active_menu');
    changeContainers('#search', 'Menu', 'Pesquisa');
}

function feedbackButton(){
    menuIsUp=false;
    createFeedbackContainer();
    $('#menu').removeClass('active_menu');
    changeContainers('#feedback', 'Menu', 'Feedback');
}

function aboutUsButton(){
    menuIsUp=false;
    createAboutUsContainer();
    $('#menu').removeClass('active_menu');
    changeContainers('#about_us', 'Menu', 'Quem somos');
}

function createMenuContainer(){
    $('#header_link').unbind().bind('click', function(){
        backButton();
    });
    
    $('#menu').addClass('active_menu');

    $('#menu_home_link').unbind().bind('click', function(){
        $('#menu').removeClass('active_menu');
        menuIsUp=false;
        changeContainers('#festivals', '', '');
        fixHeaderLink('#festivals');
        history_array.pop();
    });
    $('#menu_search_link').unbind().bind('click', function(){
        searchButton();
    });
    $('#menu_about_us_link').unbind().bind('click', function(){
        aboutUsButton();
    });
    $('#menu_feedback_link').unbind().bind('click', function(){
        feedbackButton();
    });
    $('#menu_exit_link').unbind().bind('click', function(){
        confirmExit();
    });


    $('.container').not('#menu').unbind().bind('click', function(){
        $('#menu').removeClass('active_menu');
        menuIsUp = false;
    });
}