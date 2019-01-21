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
    statusRef = database.ref("/gameStatus");
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
    gameStatus,
    player1wins = 0,
    player1losses = 0,
    player2wins = 0,
    player2losses = 0;

connectedRef.on("value", function(snap) {
    if (snap.val()) {
        var con = connectionsRef.push(true);
        con.onDisconnect().remove();
    }
});

function checkStatus() {
    statusRef.once("value", function(snap) {
        if (snap.val()) {
            gameStatus = snap.val();
        }
    });
    console.log(gameStatus);
}

// watching for database changes on the /players
playersRef.on("value", function(snap) {
    if (snap.child("player1").exists()) {
        player1 = snap.val().player1;
        player1Details = player1;
        $("#player1").find(".player-name").text(player1Details.name);
        // console.log("Player1Name: " + player1.name);
    } else {
        console.log("player1 does not exist");
        player1 = null;
        $("#player1").find(".player-name").text("waiting...");
    }
    if (snap.child("player2").exists()) {
        player2 = snap.val().player2;
        player2Details = player2;
        $("#player2").find(".player-name").text(player2Details.name);
        // console.log("Player2Name: " + player2.name);
    } else {
        console.log("player2 does not exist");
        player2 = null;
        $("#player2").find(".player-name").text("waiting...");
    }

    if (snap.child("player1").exists() && snap.child("player2").exists()) {
        checkStatus(); // this will just set the game status
        if (gameStatus != "reset" || gameStatus != "playing") {
            $("#status-area").text("Let the game begin!");
        }
        if (player1.choice != "" && player2.choice == "") {
            $("#status-area").text("Waiting for " + player2.name + " to make a choice...");
        }
        if (player1.choice == "" && player2.choice != "") {
            $("#status-area").text("Waiting for " + player1.name + " to make a choice...");
        }
    }
    else {
        $("#status-area").text("Waiting for another player...");
    }
    // console.log(snap.numChildren());

    // run comparison if both player have picked their choice
    if ((snap.child("player1").exists() && player1.choice) && (snap.child("player2").exists() && player2.choice)) {
        player1choice = player1.choice;
        player2choice = player2.choice;
        let player1img = `<img class="pick-img" src="assets/images/${player1choice}.png">`,
            player2img = `<img class="pick-img" src="assets/images/${player2choice}.png">`;
        // displaying both player's choices
        $("#player1").find(".card-body").empty().append(player1img);
        $("#player2").find(".card-body").empty().append(player2img);
        compare(player1choice, player2choice);
    }

    $("#player1").find(".wins").text(player1Details.wins);
    $("#player1").find(".losses").text(player1Details.losses);
    $("#player2").find(".wins").text(player2Details.wins);
    $("#player2").find(".losses").text(player2Details.losses);
});

// watching if there a new chat added to the database
chatRef.on("child_added", function(snap) {
    let chat = snap.val(),
        chatText = chat.text,
        chatName = chat.name ? chat.name : "System";
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

            // show choices for player2
            $("#player2").find(".choices").addClass("show");

            database.ref().child("/players/player2").set(player2Details);
            database.ref("/players/player2").onDisconnect().remove();
        }

        // playerDetails = player1Details || player2Details;
        let chat = playerName + " has joined!";

        // pushing new player joining as chat message
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

    database.ref("gameStatus").set("playing");
    database.ref("gameStatus").onDisconnect().remove();
});

$(".chat-form").on("click", "button", function(event) {
    event.preventDefault();
    let chat = $("#chat-input").val().trim();

    // pushing new chat message to db
    chatRef.push({
        name: playerName,
        text: chat
    });

    $("#chat-input").val("");
});

function compare(player1choice, player2choice) {
    console.log("Comparing...")
    if (player1choice == player2choice) {
        $("#status-area").text("IT'S A TIE");
    }
    else if (
        (player1choice == "rock" && player2choice == "scissors") ||
        (player1choice == "paper" && player2choice == "rock") ||
        (player1choice == "scissors" && player2choice == "paper")
    ) {
        // player1 wins
        $("#status-area").html("<strong>" + player1.name + " wins!" + "</strong><br/>" + player1choice + " beats " + player2choice);
        player1wins = player1Details.wins + 1;
        player2losses = player2Details.losses + 1;
        $("#player1").find(".wins").text(player1wins);
        $("#player2").find(".losses").text(player2losses);
    }
    else {
        // player2 wins
        $("#status-area").html("<strong>" + player2.name + " wins!" + "</strong><br/>" + player2choice + " beats " + player2choice);
        player2wins = player2Details.wins + 1;
        player1losses = player1Details.losses + 1;
        $("#player2").find(".wins").text(player2wins);
        $("#player1").find(".losses").text(player1losses);
    }

    setTimeout(resetChoices, 3000);
}

function resetChoices() {
    // clearTimeout(stopTimeout);
    // $("#status-area").empty();
    $("#status-area").empty().text("Players, make your choice!");
    $(".choices").prev(".card").find(".card-body").empty().text("Rock, Paper, Scissors...");
    $(".choices").find("button").removeAttr("disabled");

    playersRef.update({
        "player1/choice": "",
        "player1/wins": player1wins,
        "player1/losses": player1losses,
        "player2/choice": "",
        "player2/wins": player2wins,
        "player2/losses": player2losses
    });
    database.ref("gameStatus").set("reset");
    database.ref("gameStatus").onDisconnect().remove();
}

// focusing on the login/name form
$(function() {
  $("#player-name").focus();
});
