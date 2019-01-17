// trigger to create new player
$('#new-player').on('click', 'button', function(event) {
    event.preventDefault();

});

$('.chat-form').on('click', 'button', function(event) {
    event.preventDefault();
    let chat = $('#chat-input').val().trim();

    $('#chat-input').val('');
});
