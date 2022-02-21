import DevelopmentCard from "./DevelopmentCard";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";
import { CheckResult } from "../Checks/Checks";
import Checker from "../Checks/Checker";
import { CheckFailedReason } from "../Checks/FailedChecks";

export class YearOfPlentyCard extends DevelopmentCard {
  private resources: [Resource, Resource] | null = null;

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
      throw Error("Some arguments for playing this card are undefined");
    }
  }
}

export default YearOfPlentyCard;
