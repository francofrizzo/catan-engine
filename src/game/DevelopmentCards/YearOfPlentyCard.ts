import DevelopmentCard from "./DevelopmentCard";
import { DevelopmentCardType } from "./DevelopmentCardType";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";
import { CheckResult } from "../Checks/Checks";
import Checker from "../Checks/Checker";
import { CheckFailedReason } from "../Checks/FailedChecks";
import { GameplayError, GameplayErrorReason } from "../GameplayError/GameplayError";

export class YearOfPlentyCard extends DevelopmentCard {
  private resources: [Resource, Resource] | null = null;

  public getType(): DevelopmentCardType {
    return DevelopmentCardType.YearOfPlenty;
  }

  public victoryPoints(): number {
    return 0;
  }

  public setResources(resources: [Resource, Resource]) {
    this.resources = resources;
  }

  public canBePlayed(): CheckResult {
    return new Checker()
      .addChecks([
        super.canBePlayed,
        { check: () => this.resources !== null, elseReason: CheckFailedReason.UndefinedYearOfPlentyResources },
      ])
      .run();
  }

  public play(): void {
    if (this.holder !== null && this.resources !== null) {
      const resourcesToRecieve = new ResourceBundle();
      resourcesToRecieve.add(this.resources[0]);
      resourcesToRecieve.add(this.resources[1]);
      this.holder.recieve(resourcesToRecieve);
      super.play();
    } else {
      throw new GameplayError(GameplayErrorReason.UndefinedDevelopmentCardArguments);
    }
  }
}

export default YearOfPlentyCard;
