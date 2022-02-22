import Corner from "../Board/Corner";
import Player from "../Dynamics/Player";
import { GameplayError, GameplayErrorReason } from "../GameplayError/GameplayError";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";

export class Road {
  constructor(private player: Player, private corners: [Corner, Corner]) {}

  public getPlayer(): Player {
    return this.player;
  }

  public getCorners(): [Corner, Corner] {
    return this.corners;
  }

  public getOtherEnd(corner: Corner) {
    if (corner.is(this.corners[0])) {
      return this.corners[1];
    } else if (corner.is(this.corners[1])) {
      return this.corners[0];
    } else {
      throw new GameplayError(GameplayErrorReason.CornerDoesntBelongToRoad);
    }
  }

  public static cost(): ResourceBundle {
    return new ResourceBundle({
      [Resource.Brick]: 1,
      [Resource.Lumber]: 1,
    });
  }
}

export default Road;
