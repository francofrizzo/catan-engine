import DevelopmentCard from "./DevelopmentCard";
import GameplayError from "../Dynamics/GameplayError";

export class RoadBuildingCard extends DevelopmentCard {
  private corners: null | [[number, number], [number, number]] = null;

  public victoryPoints(): number {
    return 0;
  }

  public setCorners(corners: [[number, number], [number, number]]) {
    this.corners = corners;
  }

  public play(): void {
    if (this.holder !== null) {
      if (this.corners !== null) {
        const check1 = this.holder.canBuildRoad(this.corners[0]);
        const check2 = this.holder.canBuildRoad(this.corners[1]);
        if (!check1.allowed) {
          throw new GameplayError("Can't build Road: " + check1.reason);
        } else if (!check2.allowed) {
          throw new GameplayError("Can't build Road: " + check2.reason);
        } else {
          this.holder.buildRoad(this.corners[0], true);
          this.holder.buildRoad(this.corners[1], true);
          super.play();
        }
      } else {
        throw new GameplayError(
          "It's necessary to define which Roads to build before playing this card"
        );
      }
    } else {
      throw new GameplayError(
        "A player must hold the card before it can be played"
      );
    }
  }
}

export default RoadBuildingCard;
