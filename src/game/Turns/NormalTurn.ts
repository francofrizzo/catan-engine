import Turn, { checkIsCurrentPlayer, checkTurnNotFinished } from "./Turn";
import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Game from "../Dynamics/Game";
import GameplayError from "../Dynamics/GameplayError";
import Player from "../Dynamics/Player";
import ResourceBundle from "../Resources/ResourceBundle";

const checkDiceRolled =
  (actionDescription: string) =>
  (
    target: NormalTurn,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
  ) => {
    const originalImplementation = descriptor.value!;
    descriptor.value = function (this: NormalTurn, ...args: any[]) {
      if (this.diceRoll !== null) {
        return originalImplementation.apply(this, args);
      } else {
        throw new GameplayError(
          `The dice must be rolled before ${actionDescription}`
        );
      }
    };
  };

const checkResourcesDiscarded =
  (actionDescription: string) =>
  (
    target: NormalTurn,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
  ) => {
    const originalImplementation = descriptor.value!;
    descriptor.value = function (this: NormalTurn, ...args: any[]) {
      if (this.allResourcesDiscarded()) {
        return originalImplementation.apply(this, args);
      } else {
        throw new GameplayError(
          `All players must discard their excess of resources before ${actionDescription}`
        );
      }
    };
  };

const checkThiefMoved =
  (actionDescription: string) =>
  (
    target: NormalTurn,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
  ) => {
    const originalImplementation = descriptor.value!;
    descriptor.value = function (this: NormalTurn, ...args: any[]) {
      if (this.thiefMovedTo !== null) {
        return originalImplementation.apply(this, args);
      } else {
        throw new GameplayError(
          `The thief must be moved before ${actionDescription}`
        );
      }
    };
  };

export class NormalTurn extends Turn {
  protected diceRoll: number | null = null;
  protected collectedResources: Record<number, ResourceBundle> = {};
  protected resourcesToDiscard: Record<number, number> = {};
  protected thiefMovedTo: number | null = null;

  constructor(game: Game, player: Player) {
    super(game, player);
    this.game.getPlayers().forEach((player) => {
      this.collectedResources[player.getId()] = new ResourceBundle();
    });
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  public rollDice(player: Player): number {
    const dice = () => Math.floor(Math.random() * 6) + 1;
    this.diceRoll = dice() + dice();
    if (this.diceRoll === 7) {
      this.game.getPlayers().forEach((player) => {
        const resourcesCount = player.getResourcesCount();
        this.resourcesToDiscard[player.getId()] =
          resourcesCount <= 7 ? 0 : Math.floor(resourcesCount / 2);
      });
    }
    return this.diceRoll;
  }

  @checkTurnNotFinished
  @checkDiceRolled("collecting resources")
  public collect(player: Player, resources: ResourceBundle): void {
    if (this.availableResources(player).hasAll(resources)) {
      player.recieve(resources);
      this.collectedResources[player.getId()].addAll(resources);
    } else {
      throw new GameplayError(
        `The resources are not available for ${player.getName()} in this turn`
      );
    }
  }

  @checkTurnNotFinished
  @checkDiceRolled("collecting resources")
  public autoCollect(): void {
    this.game.getPlayers().forEach((player) => {
      const resources = player.getCollectibleResources(this.diceRoll!);
      this.collect(player, resources);
    });
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  @checkDiceRolled("building a Settlement")
  @checkResourcesDiscarded("building a Settlement")
  @checkThiefMoved("building a Settlement")
  public buildSettlement(player: Player, cornerId: number): Settlement {
    return player.buildSettlement(cornerId);
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  @checkDiceRolled("building a Road")
  @checkResourcesDiscarded("building a Road")
  @checkThiefMoved("building a Road")
  public buildRoad(
    player: Player,
    [corner1Id, corner2Id]: [number, number]
  ): Road {
    return player.buildRoad([corner1Id, corner2Id]);
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  @checkDiceRolled("building a City")
  @checkResourcesDiscarded("building a City")
  @checkThiefMoved("building a City")
  public buildCity(player: Player, cornerId: number): Settlement {
    return player.buildCity(cornerId);
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  @checkDiceRolled("buying a Development Card")
  @checkResourcesDiscarded("buying a Development Card")
  @checkThiefMoved("buying a Development Card")
  public buyDevelopmentCard(player: Player): DevelopmentCard {
    return player.buyDevelopmentCard();
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  @checkResourcesDiscarded("buying a Development Card")
  @checkThiefMoved("buying a Development Card")
  public playDevelopmentCard(player: Player, card: DevelopmentCard): void {
    player.playDevelopmentCard(card);
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  @checkDiceRolled("exchanging resources")
  @checkResourcesDiscarded("exchanging resources")
  @checkThiefMoved("exchanging resources")
  public exchange(
    player: Player,
    otherPlayer: Player,
    resourcesGiven: ResourceBundle,
    resourcesTaken: ResourceBundle
  ): void {
    player.exchange(otherPlayer, resourcesGiven, resourcesTaken);
  }

  @checkTurnNotFinished
  @checkDiceRolled("discarding resources")
  public discard(player: Player, resources: ResourceBundle): void {
    const total = resources.total();
    if (this.resourcesToDiscard[player.getId()] >= total) {
      player.giveAway(resources);
      this.resourcesToDiscard[player.getId()] -= total;
    } else {
      throw new GameplayError(
        `${player.getName()} can't discard so many resources`
      );
    }
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  @checkDiceRolled("moving the thief")
  @checkResourcesDiscarded("moving the thief")
  public moveThief(player: Player, tileId: number, stealFrom: Player | null) {
    if (this.diceRoll !== 7) {
      throw new GameplayError(
        "The thief can't be moved if the dice roll was not 7"
      );
    } else if (this.thiefMovedTo !== null) {
      throw new GameplayError("The thief was already moved in this turn");
    } else {
      this.game.getBoard().moveThief(player, tileId, stealFrom);
      this.thiefMovedTo = tileId;
    }
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  @checkDiceRolled("the turn finishes")
  @checkResourcesDiscarded("the turn finishes")
  @checkThiefMoved("the turn finishes")
  public pass(player: Player): void {
    if (this.player.victoryPoints() >= 10) {
      this.game.win(this.player);
    }
    this.player.markDevelopmentCardsAsPlayable();
    this.game.awardTokens(this.player);
    super.pass(player);
  }

  protected allResourcesDiscarded(): boolean {
    return Object.values(this.resourcesToDiscard).every((n) => n === 0);
  }

  protected availableResources(player: Player): ResourceBundle {
    if (this.diceRoll !== null) {
      return player
        .getCollectibleResources(this.diceRoll)
        .subtractAll(this.collectedResources[player.getId()]);
    } else {
      throw new Error("The dice have not been rolled");
    }
  }
}

export default NormalTurn;
