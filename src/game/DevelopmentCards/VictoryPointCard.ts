import DevelopmentCard from "./DevelopmentCard";
import Game from "../Dynamics/Game";
import GameplayError from "../Dynamics/GameplayError";
import { CheckResult } from "../Checks/Checks";

export enum VictoryPointCardType {
  /* ⛪ */ Chapel = "Chapel",
  /* 🏰 */ GreatHall = "Great Hall",
  /* 📚 */ Library = "Library",
  /* 🍎 */ Market = "Market",
  /* 🎓 */ University = "University",
}

export class VictoryPointCard extends DevelopmentCard {
  constructor(game: Game, private type: VictoryPointCardType) {
    super(game);
  }

  public canBePlayed(): CheckResult {
    return {
      value: false,
      reason: "VICTORY_POINT_CARD_IS_NOT_PLAYABLE",
    };
  }

  public play() {
    throw new Error("A Victory Point Development Card cannot be played");
  }

  public victoryPoints(): number {
    return 1;
  }
}
export default VictoryPointCard;
