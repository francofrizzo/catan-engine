import DevelopmentCard from "./DevelopmentCard";
import { DevelopmentCardType } from "./DevelopmentCardType";
import Player from "../Dynamics/Player";
import Checker from "../Checks/Checker";
import { CheckResult } from "../Checks/Checks";
import { CheckFailedReason } from "../Checks/FailedChecks";
import Tile from "../Board/Tile";
import { GameplayError, GameplayErrorReason } from "../GameplayError/GameplayError";

export class KnightCard extends DevelopmentCard {
  private destinyTile: Tile | null = null;
  private stealFrom: Player | null = null;

  public getType(): DevelopmentCardType {
    return DevelopmentCardType.Knight;
  }

  public victoryPoints(): number {
    return 0;
  }

  public setDestinyTileId(tile: Tile) {
    this.destinyTile = tile;
  }

  public setStealFrom(stealFrom: Player | null) {
    this.stealFrom = stealFrom;
  }

  public canBePlayed(): CheckResult {
    return new Checker()
      .addChecks([
        super.canBePlayed,
        { check: () => this.destinyTile !== null, elseReason: CheckFailedReason.UndefinedDestinyTile },
        () => this.game.getBoard().canMoveThief(this.holder!, this.destinyTile!, this.stealFrom),
      ])
      .run();
  }

  public play() {
    if (this.holder !== null && this.destinyTile !== null) {
      this.game.getBoard().moveThief(this.holder!, this.destinyTile, this.stealFrom);
      super.play();
    } else {
      throw new GameplayError(GameplayErrorReason.UndefinedDevelopmentCardArguments);
    }
  }

  public isKnight(): this is KnightCard {
    return true;
  }
}

export default KnightCard;
