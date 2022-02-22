import Game from "../../game/Dynamics/Game";
import { serializeBoard } from "./Board";
import { serializePlayerPlublic } from "./PlayerPublic";

export const serializeGame = (game: Game) => {
  return {
    board: serializeBoard(game.getBoard()),
    players: game.getPlayers().map((player) => serializePlayerPlublic(player)),
    developmentCardsInDeck: game.getDevelopmentCardsDeckSize(),
  };
};
