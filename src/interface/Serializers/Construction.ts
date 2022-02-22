import Construction from "../../game/Constructions/Construction";

export const serializeConstruction = (construction: Construction) => {
  return {
    player: construction.getPlayer().getId(),
    type: construction.isSettlement() ? "Settlement" : "City",
    victoryPoints: construction.victoryPoints(),
  };
};
