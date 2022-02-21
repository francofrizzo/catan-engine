import DevelopmentCard from "./DevelopmentCard";
import GameplayError from "../Dynamics/GameplayError";
import Player from "../Dynamics/Player";
import { Checker, CheckResult } from "../Checks/Checks";
import Tile from "../Board/Tile";

export class KnightCard extends DevelopmentCard {
  private destinyTile: Tile | null = null;
  private stealFrom: Player | null = null;

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
        { check: () => this.destinyTile !== null, elseReason: "UNDEFINED_DESTINY_TILE" },
        () => this.game.getBoard().canMoveThief(this.holder!, this.destinyTile!, this.stealFrom),
      ])
      .run();
  }

  public play() {
    if (this.holder !== null && this.destinyTile !== null) {
      this.game.getBoard().moveThief(this.holder!, this.destinyTile, this.stealFrom);
      super.play();
    } else {
      throw Error("Some arguments for playing this card are undefined");
    }
  }

  public isKnight(): this is KnightCard {
    return true;
  }
}

export default KnightCard;
