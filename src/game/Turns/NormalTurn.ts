import Turn from "./Turn";
import { Check, CheckResult, check } from "../Checks/Checks";
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

export class NormalTurn extends Turn {
  protected diceRoll: number | null = null;
  protected collectedResources: Record<number, ResourceBundle> = {};
  protected resourcesToDiscard: Record<number, number> = {};
  protected thiefMovedTo: Tile | null = null;

  constructor(game: Game, player: Player) {
    super(game, player);
    this.game.getPlayers().forEach((player) => {
      this.collectedResources[player.getId()] = new ResourceBundle();
    });
  }

  public canRollDice(player: Player): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      {
        check: () => this.rollDice === null,
        elseReason: "DICE_ALREADY_ROLLED",
      },
    ]);
  }

  @check((turn: NormalTurn, player: Player) => turn.canRollDice(player))
  public rollDice(player: Player): number {
    const dice = () => Math.floor(Math.random() * 6) + 1;
    this.diceRoll = dice() + dice();
    if (this.game.getOptions().autoCollect) {
      this.autoCollect();
    }
    if (this.diceRoll === 7) {
      this.game.getPlayers().forEach((player) => {
        const resourcesCount = player.getResourcesCount();
        this.resourcesToDiscard[player.getId()] = resourcesCount <= 7 ? 0 : Math.floor(resourcesCount / 2);
      });
    }
    return this.diceRoll;
  }

  public canBuildRoad(player: Player, [corner1, corner2]: [Corner, Corner]): CheckResult {
    return this.check([() => player.canBuildRoad([corner1, corner2], false)]);
  }

  @check((turn: NormalTurn, player: Player, [corner1, corner2]: [Corner, Corner]) =>
    turn.canBuildRoad(player, [corner1, corner2])
  )
  public buildRoad(player: Player, [corner1, corner2]: [Corner, Corner]): Road {
    return player.buildRoad([corner1, corner2]);
  }

  public canBuildSettlement(player: Player, corner: Corner): CheckResult {
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

  public canBuildCity(player: Player, corner: Corner): CheckResult {
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

  public canPlayDevelopmentCard(player: Player, card: DevelopmentCard): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      ...this.afterThiefSequence(),
      () => player.canPlayDevelopmentCard(card),
    ]);
  }

  @check((turn: NormalTurn, player: Player, card: DevelopmentCard) => turn.canPlayDevelopmentCard(player, card))
  public playDevelopmentCard(player: Player, card: DevelopmentCard): void {
    player.playDevelopmentCard(card);
  }

  public canCollect(player: Player, resources: ResourceBundle): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      {
        check: () => this.collectibleResources(player).hasAll(resources),
        elseReason: "RESOURCES_NOT_AVAILABLE",
      },
    ]);
  }

  @check((turn: NormalTurn, player: Player, resources: ResourceBundle) => turn.canCollect(player, resources))
  public collect(player: Player, resources: ResourceBundle): void {
    player.recieve(resources);
    this.collectedResources[player.getId()].addAll(resources);
  }

  public canDiscard(player: Player, resources: ResourceBundle): CheckResult {
    return this.check([
      this.turnNotFinished(),
      () => player.canGiveAway(resources),
      {
        check: () => this.resourcesToDiscard[player.getId()] >= resources.total(),
        elseReason: "RESOURCES_NOT_DISCARDABLE",
      },
    ]);
  }

  @check((turn: NormalTurn, player: Player, resources: ResourceBundle) => turn.canDiscard(player, resources))
  public discard(player: Player, resources: ResourceBundle): void {
    player.giveAway(resources);
    this.resourcesToDiscard[player.getId()] -= resources.total();
  }

  public canExchange(
    player: Player,
    otherPlayer: Player,
    resourcesGiven: ResourceBundle,
    resourcesTaken: ResourceBundle
  ): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      ...this.afterThiefSequence(),
      () => this.player.canExchange(otherPlayer, resourcesGiven, resourcesTaken),
    ]);
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

  public canTrade(player: Player, resourceTaken: Resource, resourceGiven: Resource): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      ...this.afterThiefSequence(),
      () => this.player.canTrade(resourceTaken, resourceGiven),
    ]);
  }

  @check((turn: NormalTurn, player: Player, resourceTaken: Resource, resourceGiven: Resource) =>
    turn.canTrade(player, resourceTaken, resourceGiven)
  )
  public trade(player: Player, resourceTaken: Resource, resourceGiven: Resource): void {
    this.player.trade(resourceTaken, resourceGiven);
  }

  public canMoveThief(player: Player, tile: Tile, stealFrom: Player | null): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      { check: () => this.diceRoll === 7, elseReason: "DICE_ROLL_IS_NOT_7" },
      { check: () => this.thiefMovedTo === null, elseReason: "THIEF_ALREADY_MOVED" },
      () => this.game.getBoard().canMoveThief(player, tile, stealFrom),
    ]);
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
    if (this.player.victoryPoints() >= 10) {
      this.game.win(this.player);
    }
    this.game.awardTokens(this.player);
    super.pass(player);
  }

  protected collectibleResources(player: Player): ResourceBundle {
    if (this.diceRoll !== null) {
      return player.getCollectibleResources(this.diceRoll).subtractAll(this.collectedResources[player.getId()]);
    } else {
      throw new Error("The dice have not been rolled");
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
      check: () => this.diceRoll === null,
      elseReason: "DICE_NOT_ROLLED",
    };
  }

  protected allResourcesDiscarded(): Check {
    return {
      check: () => Object.values(this.resourcesToDiscard).every((n) => n === 0),
      elseReason: "RESOURCES_NOT_DISCARDED",
    };
  }

  protected thiefMovedIfNeccessary(): Check {
    return {
      check: () => this.diceRoll !== 7 || this.thiefMovedTo !== null,
      elseReason: "THIEF_NOT_MOVED",
    };
  }

  protected afterThiefSequence(): Check[] {
    return [this.diceRolled(), this.allResourcesDiscarded(), this.thiefMovedIfNeccessary()];
  }
}

export default NormalTurn;
