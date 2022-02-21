import DevelopmentCard from "./DevelopmentCard";
import GameplayError from "../Dynamics/GameplayError";
import Player from "../Dynamics/Player";

export class KnightCard extends DevelopmentCard {
  private destinyTileId: number | null = null;
  private stealFrom: Player | null = null;

  public victoryPoints(): number {
    return 0;
  }

  public setDestinyTileId(tileId: number) {
    this.destinyTileId = tileId;
  }

  public setStealFrom(stealFrom: Player | null) {
    this.stealFrom = stealFrom;
  }

  public play() {
    if (this.holder !== null) {
      if (this.destinyTileId === null) {
        throw new GameplayError(
          "It's necessary to define where to move the thief before playing this card"
        );
      } else {
        this.game
          .getBoard()
          .moveThief(this.holder!, this.destinyTileId, this.stealFrom);
        super.play();
      }
    } else {
      throw new GameplayError(
        "A player must hold the card before it can be played"
      );
    }
  }

  public isKnight(): this is KnightCard {
    return true;
  }
}

export default KnightCard;
