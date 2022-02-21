import DevelopmentCard from "./DevelopmentCard";
import { CheckResult } from "../Checks/Checks";
import { CheckFailedReason } from "../Checks/FailedChecks";
import Game from "../Dynamics/Game";

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
      reason: CheckFailedReason.VictoryPointCardIsNotPlayable,
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
