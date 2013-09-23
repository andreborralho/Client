function createFeedbackContainer(){
    current_page = "feedback";

    $('#header_link').unbind().bind('click', function(){
        backButton();
    });

    $("#feedbackForm").submit(function(event) {
        submitFeedback();
    });

    if(navigator.network.connection.type == Connection.NONE)
        window.FestivallToaster.showMessage('É preciso Internet para conseguires submeter!');
}

function submitFeedback(){
    /* stop form from submitting normally */
    event.preventDefault();

    /* get some values from elements on the page: */
    var name = $('#inputFeedbackAuthor').val();
    var text = $('#inputFeedbackText').val();
    var email = $('#inputFeedbackAuthorEmail').val();


    if(name == "")
        alert("Tens que inserir o teu nome");
    else if(text == "")
        alert("Tens que falar de alguma coisa");

    else{
        $.post("http://festivall.eu/feedbacks", {name: name, text: text, email: email}, function(){

            $('#inputFeedbackText').val('');
            window.FestivallToaster.showMessage("Obrigado pela tua contribuição ;)");
        }, 'text/html');
    }
}