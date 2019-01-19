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

// setting firebase variables
let database = firebase.database(),
    connectionsRef = database.ref("/connections"),
    playersRef = database.ref("/players");
    chatRef = database.ref("/chat");
    connectedRef = database.ref(".info/connected");

// setting game variables
let player1 = null,
    player2 = null,
    playerName = null,
    player1choice = '',
    player12hoice = '',
    player1Details = {
        name: "",
        choice: "",
        wins: 0,
        losses: 0
    },
    player2Details = {
        name: "",
        choice: "",
        wins: 0,
        losses: 0
    },
    playerDetails = null;

connectedRef.on("value", function(snap) {
    if (snap.val()) {
        var con = connectionsRef.push(true);
        con.onDisconnect().remove();
    }
});

// watching for database changes on the /players
playersRef.on("value", function(snap) {
    if (snap.child("player1").exists()) {
        console.log('player1 exist');
        player1 = snap.val().player1;
    } else {
        console.log('player1 does not exist');
        player1 = null;
    }
    if (snap.child("player2").exists()) {
        console.log('player2 exist');
        player2 = snap.val().player2;
    } else {
        console.log('player2 does not exist');
        player2 = null;
    }
});

// watching for database changes on the /chat
chatRef.on("child_added", function(snap) {
    let chat = snap.val(),
        chatText = chat.text,
        chatName = chat.name ? chat.name : 'Watcher';
        chatEntry = $("<div>").html(chatName + ": " + chatText);

    $(".chat-display").append(chatEntry);
    $(".chat-display").scrollTop($(".chat-display")[0].scrollHeight);
});

// trigger to create/login new player
$('.name-form').on('click', 'button', function(event) {
    event.preventDefault();
    playerName = $("#player-name").val().trim();
    if (playerName !== "" && !(player1 && player2) ) {
        if (player1 === null) {
            console.log("added player1");
            player1Details.name = playerName;
            database.ref().child("/players/player1").set(player1Details);
            database.ref("/players/player1").onDisconnect().remove();
        }
        else if (player2 === null) {
            console.log("added player2");
            player2Details.name = playerName;
            database.ref().child("/players/player2").set(player2Details);
            database.ref("/players/player2").onDisconnect().remove();
        }

        let chat = playerName + " has joined!";

        chatRef.push({
            name: 'System',
            text: chat
        });

        $("#player-name").val("");
    }
});




// trigger to create new player
// $('.choices').on('mouseenter', 'button', function() {
//     let pick = $(this).data('pick'),
//         img = `<img class="pick-img" src="assets/images/${pick}.png">`
//     $(this).closest('.choices').prev('.card').find('.card-body').empty().append(img);
// });
// $('.choices').on("mouseleave", "button", function() {
//     let pick = $(this).data('pick');
//     $(this).closest('.choices').prev('.card').find('.card-body').empty();
// });

// trigger to post player choice
$('.choices').on("click", "button", function() {
    event.preventDefault();
    let pick = $(this).data('pick'),
        img = `<img class="pick-img" src="assets/images/${pick}.png">`
    $(this).closest('.choices').prev('.card').find('.card-body').empty().append(img);
});


$('.chat-form').on('click', 'button', function(event) {
    event.preventDefault();
    let chat = $('#chat-input').val().trim();

    chatRef.push({
        name: playerName,
        text: chat
    });

    $('#chat-input').val('');
});
