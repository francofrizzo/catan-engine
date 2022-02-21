import City from "./City";
import Settlement from "./Settlement";
import Corner from "../Board/Corner";
import Player from "../Dynamics/Player";
import ResourceBundle from "../Resources/ResourceBundle";
import Port from "../Ports/Port";

export abstract class Construction {
  constructor(protected player: Player, protected corner: Corner) {}

  public getPlayer(): Player {
    return this.player;
  }

  public getCorner(): Corner {
    return this.corner;
  }

  public hasPort(): boolean {
    return this.corner.hasPort();
  }

  public getPort(): Port | null {
    return this.corner.getPort();
  }

  public getAdjacentResources(): ResourceBundle {
    return this.corner.getAdjacentResources();
  }

  public abstract getCollectibleResources(number: number): ResourceBundle;

  public abstract victoryPoints(): number;

  public isSettlement(): this is Settlement {
    return false;
  }

  public isCity(): this is City {
    return false;
  }
}

export default Construction;
