import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Game from "../Dynamics/Game";
import GameplayError from "../Dynamics/GameplayError";
import Player from "../Dynamics/Player";
import ResourceBundle from "../Resources/ResourceBundle";

export const checkTurnNotFinished = (
  target: Turn,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
) => {
  const originalImplementation = descriptor.value!;
  descriptor.value = function (this: Turn, ...args: any[]) {
    if (!this.finished) {
      return originalImplementation.apply(this, args);
    } else {
      throw new GameplayError("This turn has already finished");
    }
  };
};

export const checkIsCurrentPlayer = (
  target: Turn,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<(player: Player, ...args: any[]) => any>
) => {
  const originalImplementation = descriptor.value!;
  descriptor.value = function (this: Turn, player: Player, ...args: any[]) {
    if (player.is(this.player)) {
      return originalImplementation.apply(this, [player, ...args]);
    } else {
      throw new GameplayError(`It's not ${player.getName()}'s turn`);
    }
  };
};

export abstract class Turn {
  protected finished = false;

  constructor(protected game: Game, protected player: Player) {}

  public getPlayer(): Player {
    return this.player;
  }

  public abstract rollDice(player: Player): number;

  public abstract buildSettlement(player: Player, cornerId: number): Settlement;
  public abstract buildCity(player: Player, cornerId: number): Settlement;
  public abstract buildRoad(
    player: Player,
    [corner1Id, corner2Id]: [number, number]
  ): Road;

  public abstract buyDevelopmentCard(player: Player): DevelopmentCard;
  public abstract playDevelopmentCard(
    player: Player,
    card: DevelopmentCard
  ): void;

  public abstract collect(player: Player, resources: ResourceBundle): void;
  public abstract exchange(
    player: Player,
    otherPlayer: Player,
    resourcesGiven: ResourceBundle,
    resourcesTaken: ResourceBundle
  ): void;
  public abstract discard(player: Player, resources: ResourceBundle): void;
  public abstract autoCollect(): void;

  public abstract moveThief(
    player: Player,
    tileId: number,
    stealFrom: Player | null
  ): void;

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  public pass(player: Player): void {
    this.finished = true;
    this.game.advanceTurn();
  }
}

export default Turn;
