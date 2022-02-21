import Corner from "../Board/Corner";
import Player from "../Dynamics/Player";
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
      throw Error("The provided corner is neither of the road ends");
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
