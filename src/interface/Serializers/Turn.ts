import Turn from "../../game/Turns/Turn";

export const serializeTurn = (turn: Turn) => {
  return {
    player: turn.getPlayer().getId(),
    diceRoll: turn.getDiceRoll(),
    eachDiceRoll: turn.getEachDiceRoll(),
  };
};
