import DevelopmentCard from "./DevelopmentCard";
import { DevelopmentCardType } from "./DevelopmentCardType";
import Corner from "../Board/Corner";
import Checker from "../Checks/Checker";
import { CheckResult } from "../Checks/Checks";
import { CheckFailedReason } from "../Checks/FailedChecks";
import { GameplayError, GameplayErrorReason } from "../GameplayError/GameplayError";

export class RoadBuildingCard extends DevelopmentCard {
  private corners: null | [[Corner, Corner], [Corner, Corner]] = null;

  public getType(): DevelopmentCardType {
    return DevelopmentCardType.RoadBuilding;
  }

  public victoryPoints(): number {
    return 0;
  }

  public setCorners(corners: [[Corner, Corner], [Corner, Corner]]) {
    this.corners = corners;
  }

  public canBePlayed(): CheckResult {
    return new Checker()
      .addChecks([
        super.canBePlayed,
        { check: () => this.corners !== null, elseReason: CheckFailedReason.UndefinedRoadBuildingCorners },
        () => this.holder!.canBuildRoad(this.corners![0], true),
        () => this.holder!.canBuildRoad(this.corners![1], true),
      ])
      .run();
  }

  public play(): void {
    if (this.holder !== null && this.corners !== null) {
      this.holder.buildRoad(this.corners[0], true);
      this.holder.buildRoad(this.corners[1], true);
      super.play();
    } else {
      throw new GameplayError(GameplayErrorReason.UndefinedDevelopmentCardArguments);
    }
  }
}

export default RoadBuildingCard;
