import Game from "./game/Dynamics/Game";

const game = new Game({ autoCollect: false });
const players = game.getPlayers();

// game.getCurrentTurn().buildSettlement(players[0], 47);
// game.getCurrentTurn().buildRoad(players[0], [48, 47]);
// game.getCurrentTurn().pass(players[0]);
// game.getCurrentTurn().buildSettlement(players[3], 29);
// game.getCurrentTurn().buildRoad(players[3], [29, 30]);
// game.getCurrentTurn().pass(players[3]);
// game.getCurrentTurn().buildSettlement(players[2], 20);
// game.getCurrentTurn().buildRoad(players[2], [20, 21]);
// game.getCurrentTurn().pass(players[2]);
// game.getCurrentTurn().buildSettlement(players[1], 17);
// game.getCurrentTurn().buildRoad(players[1], [17, 18]);
// game.getCurrentTurn().pass(players[1]);
// game.getCurrentTurn().buildSettlement(players[1], 52);
// game.getCurrentTurn().buildRoad(players[1], [53, 52]);
// game.getCurrentTurn().pass(players[1]);
// game.getCurrentTurn().buildSettlement(players[2], 37);
// game.getCurrentTurn().buildRoad(players[2], [37, 36]);
// game.getCurrentTurn().pass(players[2]);
// game.getCurrentTurn().buildSettlement(players[3], 27);
// game.getCurrentTurn().buildRoad(players[3], [27, 28]);
// game.getCurrentTurn().pass(players[3]);
// game.getCurrentTurn().buildSettlement(players[0], 0);
// game.getCurrentTurn().buildRoad(players[0], [0, 1]);
// while (dice !== 7) {
//   game.getCurrentTurn().pass();
//   dice = game.getCurrentTurn().rollDice();
// }
// // game.getCurrentTurn().moveThief(14);
// game.getCurrentTurn().pass();
