import DevelopmentCard from "./DevelopmentCard";
import GameplayError from "../Dynamics/GameplayError";
import Resource from "../Resources/Resource";
import { Checker, CheckResult } from "../Checks/Checks";

export class MonopolyCard extends DevelopmentCard {
  private resource: Resource | null = null;

  public victoryPoints(): number {
    return 0;
  }

  public setResource(resource: Resource) {
    this.resource = resource;
  }

  public canBePlayed(): CheckResult {
    return new Checker()
      .addChecks([super.canBePlayed(), { check: this.resource !== null, elseReason: "UNDEFINED_MONOPOLY_RESOURCE" }])
      .run();
  }

  public play(): void {
    if (this.holder !== null && this.resource !== null) {
      this.game
        .getPlayers()
        .filter((player) => !player.is(this.holder!))
        .forEach((player) => {
          const stolenResources = player.giveAwayAll(this.resource!);
          this.holder!.recieve(stolenResources);
        });
      super.play();
    } else {
      throw Error("Some arguments for playing this card are undefined");
    }
  }
}

export default MonopolyCard;
