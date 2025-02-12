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
  SCORES[role].text(points);
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
    //end game
  } else if (CURRENT_GAME.player.points > 21) {
    CURRENT_GAME.winner = "crupier";
    alert("El jugador ha perdido por sobrepasar 21");
  } else {
    //preguntar si quiere otra carta
    askForAnotherCard();
  }
}

function askForAnotherCard() {
  console.log("Preguntar si quiere otra carta");
  toggleButtons("show");

  $("#ask-btn").on("click", async function () {
    toggleButtons("hide");

    await giveCard("player", 1);

    checkPlayerPoints();
  });

  $("#stop-btn").on("click", function () {
    toggleButtons("hide");
    // logic to handle the player standing
    playCrupier();
  });
}

async function playCrupier() {
  //revelar primera carta
  while (CURRENT_GAME.crupier.points < 17) {
    const first_card = CURRENT_GAME.crupier.cards[0];
    $("#back-card").attr("src", `./${first_card.img}`);
    CURRENT_GAME.crupier.onGame = true
    await new Promise((resolve) => setTimeout(resolve, 1000));
    calculatePoints("crupier");
    await giveCard("crupier", 1);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  compareScores();
}

function compareScores() {
  if (CURRENT_GAME.crupier.points > 21) {
    CURRENT_GAME.winner = "player";
    alert("El jugador ha ganado por el crupier sobrepasar 21");
  } else if (CURRENT_GAME.crupier.points > CURRENT_GAME.player.points) {
    CURRENT_GAME.winner = "crupier";
    alert("El jugador ha perdido por tener menos puntos que el crupier");
  } else if (CURRENT_GAME.crupier.points < CURRENT_GAME.player.points) {
    CURRENT_GAME.winner = "player";
    alert("El jugador ha ganado por tener más puntos que el crupier");
  } else {
    CURRENT_GAME.winner = "draw";
    alert("Empate");
  }
}

function toggleButtons(action) {
  if (action === "show") {
    $("#buttons").addClass("active");
  } else if (action === "hide") {
    $("#buttons").removeClass("active");
  }
}

async function start() {
  CURRENT_GAME = { ...new_game };
  // dar dos cartas al jugador
  await giveCard("player", 2);

  //dar dos cartas al dealer
  await giveCard("crupier", 2);
  //si es 21 ganar
  checkPlayerPoints();

  //si no es 21 preguntar si pedir otra carta

  //calcular puntos del jugador
  console.log(CURRENT_GAME);
}

start();
