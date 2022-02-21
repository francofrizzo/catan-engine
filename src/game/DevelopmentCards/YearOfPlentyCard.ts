import DevelopmentCard from "./DevelopmentCard";
import GameplayError from "../Dynamics/GameplayError";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";

export class YearOfPlentyCard extends DevelopmentCard {
  private resources: [Resource, Resource] | null = null;

  public victoryPoints(): number {
    return 0;
  }

  public setResources(resources: [Resource, Resource]) {
    this.resources = resources;
  }

  public play(): void {
    if (this.holder !== null) {
      if (this.resources !== null) {
        const resourcesToRecieve = new ResourceBundle();
        resourcesToRecieve.add(this.resources[0]);
        resourcesToRecieve.add(this.resources[1]);
        this.holder.recieve(resourcesToRecieve);
        super.play();
      } else {
        throw new GameplayError(
          "It's necessary to define which resources to get before playing this card"
        );
      }
    } else {
      throw new GameplayError(
        "A player must hold the card before it can be played"
      );
    }
  }
}

export default YearOfPlentyCard;
