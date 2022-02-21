import DevelopmentCard from "./DevelopmentCard";
import GameplayError from "../Dynamics/GameplayError";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";
import { Checker, CheckResult } from "../Checks/Checks";

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
        super.canBePlayed(),
        { check: this.resources !== null, elseReason: "UNDEFINED_YEAR_OF_PLENTY_RESOURCES" },
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
