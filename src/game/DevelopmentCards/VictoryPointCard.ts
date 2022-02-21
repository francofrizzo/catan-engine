import DevelopmentCard from "./DevelopmentCard";
import Game from "../Dynamics/Game";
import GameplayError from "../Dynamics/GameplayError";

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

  public play() {
    throw new GameplayError(
      "A Victory Point Development Card cannot be played"
    );
  }

  public victoryPoints(): number {
    return 1;
  }
}
export default VictoryPointCard;
