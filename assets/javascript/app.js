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
    playerDetails = null,
    stopTimeout;

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
        player1Details = player1;
        // console.log("Player1Name: " + player1.name);
    } else {
        console.log("player1 does not exist");
        player1 = null;
    }
    if (snap.child("player2").exists()) {
        player2 = snap.val().player2;
        player2Details = player2;
        // console.log("Player2Name: " + player2.name);
    } else {
        console.log("player2 does not exist");
        player2 = null;
    }

    // run comparison if both player have picked their choice
    if ((snap.child("player1").exists() && player1.choice) && (snap.child("player2").exists() && player2.choice)) {
        player1choice = player1.choice;
        player2choice = player2.choice;
        console.log("compare")
        let player1img = `<img class="pick-img" src="assets/images/${player1choice}.png">`,
            player2img = `<img class="pick-img" src="assets/images/${player2choice}.png">`;
        // displaying both player's choices
        $("#player1").find(".card-body").empty().append(player1img);
        $("#player2").find(".card-body").empty().append(player2img);
        compare(player1choice, player2choice);
    }
});

// watching if there a new chat added to the database
chatRef.on("child_added", function(snap) {
    let chat = snap.val(),
        chatText = chat.text,
        chatName = chat.name ? chat.name : "Anonymous";
        chatEntry = `<div><span class="chat-user">${chatName}:</span> ${chatText}</div>`
        // chatEntry = $("<div>").html(chatName + ": " + chatText);

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
            player1Details.name = playerName;

            // show choices for player1
            $("#player1").find(".choices").addClass("show");

            database.ref().child("/players/player1").set(player1Details);
            database.ref("/players/player1").onDisconnect().remove();
        }
        else if (player2 === null) {
            console.log("added player2");
            player2Details.name = playerName;

            // show choices for player1
            $("#player2").find(".choices").addClass("show");

            database.ref().child("/players/player2").set(player2Details);
            database.ref("/players/player2").onDisconnect().remove();
        }

        playerDetails = player1Details || player2Details;
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

// showing/removing choice image on hover
$(".choices").on("mouseenter", "button", function() {
    let choice = $(this).data("choice"),
        img = `<img class="pick-img" src="assets/images/${choice}.png">`
    $(this).closest(".choices").prev(".card").find(".card-body").empty().append(img);
});
$(".choices").on("mouseleave", "button", function() {
    $(this).closest(".choices").prev(".card").find(".card-body").empty().text("Rock, Paper, Scissors...");
});

// trigger to post player choice
$(".choices").on("click", "button", function() {
    event.preventDefault();
    let choice = $(this).data("choice"),
        img = `<img class="pick-img" src="assets/images/${choice}.png">`,
        player = $(this).closest(".choices").data("player");
    $(this).closest(".choices").prev(".card").find(".card-body").empty().append(img);
    $(this).closest(".choices").find("button").attr("disabled", "disabled");

    // updating the palayer's choice
    database.ref("/players/" + player).update({
      "choice": choice
    });
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

function compare(player1choice, player2choice) {
    let player1wins = player1.wins,
        player1losses = player1.losses,
        player2wins = player2.wins,
        player2losses = player2.losses;

    if (player1choice == player2choice) {
        $("#result-area").text("IT'S A TIE");
    }
    else if (
        (player1choice == "rock" && player2choice == "scissors") ||
        (player1choice == "paper" && player2choice == "rock") ||
        (player1choice == "scissors" && player2choice == "paper")
    ) {
        // player1 wins
        $("#result-area").html("<small>" + player1choice + " beats " + player2choice + "</small><br/>" + player1.name + " wins!");
        player1wins = player1Details.wins + 1;
        player2losses = player2Details.losses + 1;
    } else {
        // player2 wins
        $("#result-area").html("<small>" + player2choice + " beats " + player1choice + "</small><br/>" + player2.name + " wins!");
        player2wins = player2Details.wins + 1;
        player1losses = player1Details.losses + 1;
    }

    database.ref("/players/player1").update({
      "choice": "",
      "wins": player1wins,
      "losses": player1losses
    });
    database.ref("/players/player2").update({
      "choice": "",
      "wins": player2wins,
      "losses": player2losses
    });

    // needed to have this here to prevent resetting the choices triggering the datbase change
    setTimeout(resetChoices, 3000);
}

function resetChoices() {
    // clearTimeout(stopTimeout);
    $(".choices").prev(".card").find(".card-body").empty().text("Rock, Paper, Scissors...");
    $(".choices").find("button").removeAttr("disabled");
}

// focusing on the name form when page is initially loaded
$(function() {
  $("#player-name").focus();
});
