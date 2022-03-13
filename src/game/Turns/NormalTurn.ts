import Turn from "./Turn";
import { Check, CheckResult, check } from "../Checks/Checks";
import { CheckFailedReason } from "../Checks/FailedChecks";
import City from "../Constructions/City";
import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Game from "../Dynamics/Game";
import Player from "../Dynamics/Player";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";
import Corner from "../Board/Corner";
import Tile from "../Board/Tile";
import { GameplayError, GameplayErrorReason } from "../GameplayError/GameplayError";

export class NormalTurn extends Turn {
  protected eachDiceRoll: [number, number] | null = null;
  protected collectedResources: Record<number, ResourceBundle> = {};
  protected resourcesToDiscard: Record<number, number> = {};
  protected thiefMovedTo: Tile | null = null;
  protected developmentCardPlayed: DevelopmentCard | null = null;

  constructor(game: Game, player: Player) {
    super(game, player);
    this.game.getPlayers().forEach((player) => {
      this.collectedResources[player.getId()] = new ResourceBundle();
    });
  }

  protected get diceRoll(): number | null {
    if (this.eachDiceRoll !== null) {
      return this.eachDiceRoll[0] + this.eachDiceRoll[1];
    } else {
      return null;
    }
  }

  public canRollDice(player: Player): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      {
        check: () => this.diceRoll === null,
        elseReason: CheckFailedReason.DiceAlreadyRolled,
      },
    ]);
  }

  @check((turn: NormalTurn, player: Player) => turn.canRollDice(player))
  public rollDice(player: Player): number {
    const dice = () => Math.floor(Math.random() * 6) + 1;
    this.eachDiceRoll = [dice(), dice()];
    const diceRoll = this.eachDiceRoll[0] + this.eachDiceRoll[1];
    if (diceRoll === 7) {
      this.game.getPlayers().forEach((player) => {
        const resourcesCount = player.getResourcesCount();
        this.resourcesToDiscard[player.getId()] = resourcesCount <= 7 ? 0 : Math.floor(resourcesCount / 2);
      });
    } else {
      this.game.getPlayers().forEach((player) => {
        this.resourcesToDiscard[player.getId()] = 0;
      });
      if (this.game.getOptions().autoCollect) {
        this.autoCollect();
      }
    }
    return diceRoll;
  }

  public getDiceRoll(): number | null {
    return this.diceRoll;
  }

  public getEachDiceRoll(): [number, number] | null {
    return this.eachDiceRoll;
  }

  public canBuildRoad(player: Player, corners?: [Corner, Corner]): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      ...this.afterThiefSequence(),
      () => player.canBuildRoad(corners, false),
    ]);
  }

  @check((turn: NormalTurn, player: Player, [corner1, corner2]: [Corner, Corner]) =>
    turn.canBuildRoad(player, [corner1, corner2])
  )
  public buildRoad(player: Player, [corner1, corner2]: [Corner, Corner]): Road {
    return player.buildRoad([corner1, corner2]);
  }

  public canBuildSettlement(player: Player, corner?: Corner): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      ...this.afterThiefSequence(),
      () => player.canBuildSettlement(corner, false, true),
    ]);
  }

  @check((turn: NormalTurn, player: Player, corner: Corner) => turn.canBuildSettlement(player, corner))
  public buildSettlement(player: Player, corner: Corner): Settlement {
    return player.buildSettlement(corner);
  }

  public canBuildCity(player: Player, corner?: Corner): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      ...this.afterThiefSequence(),
      () => player.canBuildCity(corner),
    ]);
  }

  @check((turn: NormalTurn, player: Player, corner: Corner) => turn.canBuildCity(player, corner))
  public buildCity(player: Player, corner: Corner): City {
    return player.buildCity(corner);
  }

  public canBuyDevelopmentCard(player: Player): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      ...this.afterThiefSequence(),
      () => player.canBuyDevelopmentCard(),
    ]);
  }

  @check((turn: NormalTurn, player: Player) => turn.canBuyDevelopmentCard(player))
  public buyDevelopmentCard(player: Player): DevelopmentCard {
    return player.buyDevelopmentCard(this);
  }

  public canPlayDevelopmentCard(player: Player, card?: DevelopmentCard): CheckResult {
    const checks = [
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      ...this.afterThiefSequence(),
      {
        check: () => this.developmentCardPlayed === null,
        elseReason: CheckFailedReason.DevelopmentCardAlreadyPlayedInTurn,
      },
    ];
    if (card !== undefined) {
      checks.push(() => player.canPlayDevelopmentCard(card));
    }
    return this.check(checks);
  }

  @check((turn: NormalTurn, player: Player, card: DevelopmentCard) => turn.canPlayDevelopmentCard(player, card))
  public playDevelopmentCard(player: Player, card: DevelopmentCard): void {
    player.playDevelopmentCard(card);
    this.developmentCardPlayed = card;
  }

  public canCollect(player: Player, resources?: ResourceBundle): CheckResult {
    const checks = [this.turnNotFinished(), ...this.afterThiefSequence()];
    if (resources !== undefined) {
      checks.push({
        check: () => this.collectibleResources(player).hasAll(resources),
        elseReason: CheckFailedReason.ResourcesNotAvailable,
      });
    }
    return this.check(checks);
  }

  @check((turn: NormalTurn, player: Player, resources: ResourceBundle) => turn.canCollect(player, resources))
  public collect(player: Player, resources: ResourceBundle): void {
    player.recieve(resources);
    this.collectedResources[player.getId()].addAll(resources);
  }

  public getResourcesToDiscard(): Record<number, number> {
    return this.resourcesToDiscard;
  }

  public canDiscard(player: Player, resources?: ResourceBundle): CheckResult {
    const checks = [
      this.turnNotFinished(),
      this.diceRolled(),
      {
        check: () => this.resourcesToDiscard[player.getId()] > 0,
        elseReason: CheckFailedReason.ResourcesNotDiscardable,
      },
    ];
    if (resources !== undefined) {
      checks.push(() => player.canGiveAway(resources));
      checks.push({
        check: () => this.resourcesToDiscard[player.getId()] >= resources.total(),
        elseReason: CheckFailedReason.ResourcesNotDiscardable,
      });
    }
    return this.check(checks);
  }

  @check((turn: NormalTurn, player: Player, resources: ResourceBundle) => turn.canDiscard(player, resources))
  public discard(player: Player, resources: ResourceBundle): void {
    player.giveAway(resources);
    this.resourcesToDiscard[player.getId()] -= resources.total();
  }

  public canExchange(
    player: Player,
    otherPlayer?: Player,
    resourcesGiven?: ResourceBundle,
    resourcesTaken?: ResourceBundle
  ): CheckResult {
    const checks = [this.turnNotFinished(), this.isCurrentPlayer(player), ...this.afterThiefSequence()];
    if (otherPlayer !== undefined && resourcesGiven !== undefined && resourcesTaken !== undefined) {
      checks.push(() => this.player.canExchange(otherPlayer, resourcesGiven, resourcesTaken));
    }
    return this.check(checks);
  }

  @check(
    (
      turn: NormalTurn,
      player: Player,
      otherPlayer: Player,
      resourcesGiven: ResourceBundle,
      resourcesTaken: ResourceBundle
    ) => turn.canExchange(player, otherPlayer, resourcesGiven, resourcesTaken)
  )
  public exchange(
    player: Player,
    otherPlayer: Player,
    resourcesGiven: ResourceBundle,
    resourcesTaken: ResourceBundle
  ): void {
    player.exchange(otherPlayer, resourcesGiven, resourcesTaken);
  }

  public canTrade(player: Player, resourceTaken?: Resource, resourceGiven?: Resource): CheckResult {
    const checks = [this.turnNotFinished(), this.isCurrentPlayer(player), ...this.afterThiefSequence()];
    if (resourceTaken !== undefined && resourceGiven !== undefined) {
      checks.push(() => this.player.canTrade(resourceTaken, resourceGiven));
    }
    return this.check(checks);
  }

  @check((turn: NormalTurn, player: Player, resourceTaken: Resource, resourceGiven: Resource) =>
    turn.canTrade(player, resourceTaken, resourceGiven)
  )
  public trade(player: Player, resourceTaken: Resource, resourceGiven: Resource): void {
    this.player.trade(resourceTaken, resourceGiven);
  }

  public canMoveThief(player: Player, tile?: Tile, stealFrom?: Player | null): CheckResult {
    const checks = [
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      { check: () => this.diceRoll === 7, elseReason: CheckFailedReason.DiceRollIsNot7 },
      this.allResourcesDiscarded(),
      { check: () => this.thiefMovedTo === null, elseReason: CheckFailedReason.ThiefAlreadyMoved },
    ];
    if (tile !== undefined && stealFrom !== undefined) {
      checks.push(() => this.game.getBoard().canMoveThief(player, tile, stealFrom));
    }
    return this.check(checks);
  }

  @check((turn: NormalTurn, player: Player, tile: Tile, stealFrom: Player | null) =>
    turn.canMoveThief(player, tile, stealFrom)
  )
  public moveThief(player: Player, tile: Tile, stealFrom: Player | null): void {
    this.game.getBoard().moveThief(player, tile, stealFrom);
    this.thiefMovedTo = tile;
  }

  public canPass(player: Player): CheckResult {
    return this.check([this.turnNotFinished(), this.isCurrentPlayer(player), ...this.afterThiefSequence()]);
  }

  @check((turn: NormalTurn, player: Player) => turn.canPass(player))
  public pass(player: Player): void {
    if (this.player.getVictoryPoints() >= 10) {
      this.game.win(this.player);
    }
    this.game.awardTokensToPlayer(this.player);
    super.pass(player);
  }

  protected collectibleResources(player: Player): ResourceBundle {
    if (this.diceRoll !== null) {
      return player.getCollectibleResources(this.diceRoll).subtractAll(this.collectedResources[player.getId()]);
    } else {
      throw new GameplayError(GameplayErrorReason.DiceNotRolled);
    }
  }

  protected autoCollect(): void {
    this.game.getPlayers().forEach((player) => {
      const resources = player.getCollectibleResources(this.diceRoll!);
      this.collect(player, resources);
    });
  }

  // Checks
  protected diceRolled(): Check {
    return {
      check: () => this.diceRoll !== null,
      elseReason: CheckFailedReason.DiceNotRolled,
    };
  }

  protected allResourcesDiscarded(): Check {
    return {
      check: () => Object.values(this.resourcesToDiscard).every((n) => n === 0),
      elseReason: CheckFailedReason.ResourcesNotDiscarded,
    };
  }

  protected thiefMovedIfNeccessary(): Check {
    return {
      check: () => this.diceRoll !== 7 || this.thiefMovedTo !== null,
      elseReason: CheckFailedReason.ThiefNotMoved,
    };
  }

  protected afterThiefSequence(): Check[] {
    return [this.diceRolled(), this.allResourcesDiscarded(), this.thiefMovedIfNeccessary()];
  }
}

export default NormalTurn;
