import Construction from "./Construction";
import Corner from "../Board/Corner";
import Player from "../Dynamics/Player";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";

export class Settlement extends Construction {
  public getCollectibleResources(number: number): ResourceBundle {
    return this.corner.getCollectibleResources(number);
  }

  public static cost(): ResourceBundle {
    return new ResourceBundle({
      [Resource.Brick]: 1,
      [Resource.Grain]: 1,
      [Resource.Lumber]: 1,
      [Resource.Wool]: 1,
    });
  }

  public victoryPoints(): number {
    return 1;
  }

  public isSettlement(): this is Settlement {
    return true;
  }
}

export default Settlement;
