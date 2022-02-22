import DevelopmentCard from "./DevelopmentCard";
import { VictoryPointCardType } from "./DevelopmentCardType";
import { CheckResult } from "../Checks/Checks";
import { CheckFailedReason } from "../Checks/FailedChecks";
import Game from "../Dynamics/Game";
import { GameplayError, GameplayErrorReason } from "../GameplayError/GameplayError";

export class VictoryPointCard extends DevelopmentCard {
  constructor(game: Game, private type: VictoryPointCardType) {
    super(game);
  }

  public getType(): VictoryPointCardType {
    return this.type;
  }

  public canBePlayed(): CheckResult {
    return {
      value: false,
      reason: CheckFailedReason.VictoryPointCardIsNotPlayable,
    };
  }

  public isPlayable(): boolean {
    return false;
  }

  public play() {
    throw new GameplayError(GameplayErrorReason.VictoryPointCardIsNotPlayable);
  }

  public victoryPoints(): number {
    return 1;
  }
}
export default VictoryPointCard;
