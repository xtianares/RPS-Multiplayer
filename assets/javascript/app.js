// Initialize Firebase
var config = {
    apiKey: "AIzaSyDyrKcJT_lH3KdyT3wXXG6A8b3ytgmUboc",
    authDomain: "rps-online-f755e.firebaseapp.com",
    databaseURL: "https://rps-online-f755e.firebaseio.com",
    projectId: "rps-online-f755e",
    storageBucket: "rps-online-f755e.appspot.com",
    messagingSenderId: "238031074251"
};
firebase.initializeApp(config);

let database = firebase.database(),
    connectionsRef = database.ref("/connections"),
    connectedRef = database.ref(".info/connected");

connectedRef.on("value", function(snap) {
    if (snap.val()) {
        var con = connectionsRef.push(true);
        con.onDisconnect().remove();
    }
});

connectionsRef.on("value", function(snap) {
    console.log(snap.numChildren())
});



// trigger to create new player
$('.name-form').on('click', 'button', function(event) {
    event.preventDefault();

});

$('.chat-form').on('click', 'button', function(event) {
    event.preventDefault();
    let chat = $('#chat-input').val().trim();

    $('#chat-input').val('');
});
