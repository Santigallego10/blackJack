import CARDS from "./cards.js";

let GAMES = [];
let CURRENT_GAME = null;

const SCORES = {
  player: $("#player-score"),
  crupier: $("#crupier-score"),
};

const new_game = {
  player: {
    name: "Player",
    cards: [],
    points: 0,
  },
  crupier: {
    name: "Crupier",
    cards: [],
    points: 0,
    onGame: false,
  },
  deck: CARDS.sort(() => Math.random() - 0.5),
  played_cards: [],
  winner: null,
};

function calculatePoints(role) {
  const cards = CURRENT_GAME[role].cards;
  let points = 0;

  if (
    role === "crupier" &&
    cards.length <= 2 &&
    CURRENT_GAME.crupier.onGame === false
  ) {
    points = cards.length == 1 ? 0 : cards[cards.length - 1].value;
  } else {
    cards.forEach((card) => {
      points += card.value;
    });
  }
  CURRENT_GAME[role].points = points;
  SCORES[role].text(CURRENT_GAME[role].points);
}

function displayCard(role, card) {
  const container = $("#container-" + role.toLowerCase());
  const is_first_card = container.children().length === 0;

  let card_html =
    is_first_card && role == "crupier"
      ? `<div class="card">
                <img src="./assets/cards/BACK.png" alt="Card" class="card-img" id="back-card">
            </div>`
      : `<div class="card">
                <img src="./${card.img}" alt="Card" class="card-img">
            </div>`;
  container.append(card_html);
}

async function giveCard(role, qty) {
  for (let i = 0; i < qty; i++) {
    const card = CURRENT_GAME.deck.pop();
    CURRENT_GAME[role].cards.push(card);
    calculatePoints(role);
    displayCard(role, card);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

function checkPlayerPoints() {
  if (
    CURRENT_GAME.player.points === 21 &&
    CURRENT_GAME.player.cards.length === 2
  ) {
    CURRENT_GAME.winner = "player";
    alert("El jugador ha ganado por blackjack");
    endGame();
  } else if (CURRENT_GAME.player.points > 21) {
    CURRENT_GAME.winner = "crupier";
    alert("El jugador ha perdido por sobrepasar 21");
    endGame();
  } else {
    //preguntar si quiere otra carta
    askForAnotherCard();
  }
}

function askForAnotherCard() {
  console.log("Preguntar si quiere otra carta");
  toggleButtons("show");

  $("#ask-btn")
    .off("click")
    .on("click", async function () {
      toggleButtons("hide");
      await giveCard("player", 1);
      checkPlayerPoints();
    });

  $("#stop-btn")
    .off("click")
    .on("click", function () {
      toggleButtons("hide");
      playCrupier();
    });
}

async function playCrupier() {
  CURRENT_GAME.crupier.onGame = true;
  SCORES["crupier"].text(
    CURRENT_GAME.crupier.cards[1].value + CURRENT_GAME.crupier.cards[0].value
  );
  const first_card = CURRENT_GAME.crupier.cards[0];
  $("#back-card").attr("src", `./${first_card.img}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  calculatePoints("crupier");

  while (CURRENT_GAME.crupier.points < 17) {
    await giveCard("crupier", 1);
  }
  compareScores();
}

function compareScores() {
  if (CURRENT_GAME.crupier.points > 21) {
    CURRENT_GAME.winner = "player";
    alert("El jugador ha ganado por el crupier sobrepasar 21");
    endGame();
  } else if (CURRENT_GAME.crupier.points > CURRENT_GAME.player.points) {
    CURRENT_GAME.winner = "crupier";
    alert("El jugador ha perdido por tener menos puntos que el crupier");
    endGame();
  } else if (CURRENT_GAME.crupier.points < CURRENT_GAME.player.points) {
    CURRENT_GAME.winner = "player";
    alert("El jugador ha ganado por tener más puntos que el crupier");
    endGame();
  } else {
    CURRENT_GAME.winner = "draw";
    alert("Empate");
    endGame();
  }
}

function endGame() {
  toggleButtons("hide");
  GAMES.push(JSON.parse(JSON.stringify(CURRENT_GAME)));

  CURRENT_GAME = null;
  SCORES.crupier.text(0);
  SCORES.player.text(0);
  $("#container-player").empty();
  $("#container-crupier").empty();

  start();
}

function toggleButtons(action) {
  if (action === "show") {
    $("#buttons").addClass("active");
  } else if (action === "hide") {
    $("#buttons").removeClass("active");
  }
}

async function start() {
  console.table(GAMES);
  console.log(GAMES)
  CURRENT_GAME = JSON.parse(JSON.stringify(new_game));
  CURRENT_GAME.deck = CARDS.sort(() => Math.random() - 0.5);
  CURRENT_GAME.played_cards = [];
  console.log("NUEVO JUEGO:");
  await giveCard("player", 2);
  await giveCard("crupier", 2);
  checkPlayerPoints();
}

start();
