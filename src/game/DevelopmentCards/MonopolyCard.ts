import DevelopmentCard from "./DevelopmentCard";
import GameplayError from "../Dynamics/GameplayError";
import Resource from "../Resources/Resource";

export class MonopolyCard extends DevelopmentCard {
  private resource: Resource | null = null;

  public victoryPoints(): number {
    return 0;
  }

  public setResource(resource: Resource) {
    this.resource = resource;
  }

  public play(): void {
    if (this.holder !== null) {
      if (this.resource !== null) {
        this.game
          .getPlayers()
          .filter((player) => !player.is(this.holder!))
          .forEach((player) => {
            const stolenResources = player.stealAll(this.resource!);
            this.holder!.recieve(stolenResources);
          });
        super.play();
      } else {
        throw new GameplayError(
          "It's necessary to define which resource to get before playing this card"
        );
      }
    } else {
      throw new GameplayError(
        "A player must hold the card before it can be played"
      );
    }
  }
}

export default MonopolyCard;
