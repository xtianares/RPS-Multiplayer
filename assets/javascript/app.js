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
    player1choice = "",
    player2choice = "",
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
        player1 = snap.val().player1;
        console.log("Player1Name: " + player1.name);
    } else {
        console.log("player1 does not exist");
        player1 = null;
    }
    if (snap.child("player2").exists()) {
        player2 = snap.val().player2;
        console.log("Player2Name: " + player2.name);
    } else {
        console.log("player2 does not exist");
        player2 = null;
    }

    // grab the players choices if it has been made
    if (snap.child("player1").exists() && player1.choice) {
        player1choice = player1.choice;
        console.log(player1choice);
    }
    if (snap.child("player2").exists() && player2.choice) {
        player2choice = player2.choice;
        console.log(player2choice);
    }
    // run comparison if both player have picked their choice
    if (player1choice && player2choice) {
        console.log("compare")
        let img1 = `<img class="pick-img" src="assets/images/${player1choice}.png">`,
            img2 = `<img class="pick-img" src="assets/images/${player2choice}.png">`
        $("#player1").find(".card-body").empty().append(img1);
        $("#player2").find(".card-body").empty().append(img2);
        // compare(player1Details.choice, player2Details.choice);
    }

});

// watching for database changes on the /chat
chatRef.on("child_added", function(snap) {
    let chat = snap.val(),
        chatText = chat.text,
        chatName = chat.name ? chat.name : "Watcher";
        chatEntry = $("<div>").html(chatName + ": " + chatText);

    $(".chat-display").append(chatEntry);
    $(".chat-display").scrollTop($(".chat-display")[0].scrollHeight);
});

// trigger to create/login new player
$(".name-form").on("click", "button", function(event) {
    event.preventDefault();
    playerName = $("#player-name").val().trim();
    if (playerName !== "" && !(player1 && player2) ) {
        if (player1 === null) {
            console.log("added player1");
            playerDetails = player1Details;
            playerDetails.name = playerName;
            database.ref().child("/players/player1").set(playerDetails);
            database.ref("/players/player1").onDisconnect().remove();
        }
        else if (player2 === null) {
            console.log("added player2");
            playerDetails = player2Details;
            playerDetails.name = playerName;
            database.ref().child("/players/player2").set(playerDetails);
            database.ref("/players/player2").onDisconnect().remove();
        }

        let chat = playerName + " has joined!";

        chatRef.push({
            name: "System",
            text: chat
        });

        $("#player-name").val("");
        $("#start-row").hide();
        $("#game-row").addClass("show");
        $("#chat-row").addClass("show");
    }
});

// trigger to create new player
// $(".choices").on("mouseenter", "button", function() {
//     let pick = $(this).data("pick"),
//         img = `<img class="pick-img" src="assets/images/${pick}.png">`
//     $(this).closest(".choices").prev(".card").find(".card-body").empty().append(img);
// });
// $(".choices").on("mouseleave", "button", function() {
//     let pick = $(this).data("pick");
//     $(this).closest(".choices").prev(".card").find(".card-body").empty();
// });

// trigger to post player choice
$(".choices").on("click", "button", function() {
    event.preventDefault();
    let pick = $(this).data("pick"),
        img = `<img class="pick-img" src="assets/images/${pick}.png">`,
        player = $(this).closest(".choices").data("player");
    $(this).closest(".choices").prev(".card").find(".card-body").empty().append(img);
    $(this).closest(".choices").find("button").attr("disabled", "disabled");

    // in case I mess up and displayed choices even if nobody is logged in
    if (!playerDetails) return;
    // playerDetails is the current player's so we can use it to set the choice properly
    playerDetails.choice = pick;
    database.ref("/players/" + player).set(playerDetails);
});

$(".chat-form").on("click", "button", function(event) {
    event.preventDefault();
    let chat = $("#chat-input").val().trim();

    chatRef.push({
        name: playerName,
        text: chat
    });

    $("#chat-input").val("");
});
