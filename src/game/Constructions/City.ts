import Construction from "./Construction";
import Corner from "../Board/Corner";
import Player from "../Dynamics/Player";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";

export class City extends Construction {
  public getCollectibleResources(number: number): ResourceBundle {
    return this.corner.getCollectibleResources(number).multiply(2);
  }

  public static cost(): ResourceBundle {
    return new ResourceBundle({
      [Resource.Grain]: 2,
      [Resource.Ore]: 3,
    });
  }

  public victoryPoints(): number {
    return 2;
  }

  public isCity(): this is City {
    return true;
  }
}

export default City;
