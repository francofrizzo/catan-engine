import Corner from "../Board/Corner";
import Tile from "../Board/Tile";
import Checker from "../Checks/Checker";
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

export abstract class Turn {
  protected finished = false;

  constructor(protected game: Game, protected player: Player) {}

  public getPlayer(): Player {
    return this.player;
  }

  public hasFinished(): boolean {
    return this.finished;
  }

  // Roll dice
  public abstract canRollDice(player: Player): CheckResult;
  public abstract rollDice(player: Player): number;
  public abstract getDiceRoll(): number | null;
  public abstract getEachDiceRoll(): [number, number] | null;

  // Constructions
  public abstract canBuildRoad(player: Player): CheckResult;
  public abstract canBuildRoad(player: Player, [corner1, corner2]: [Corner, Corner]): CheckResult;
  public abstract buildRoad(player: Player, [corner1, corner2]: [Corner, Corner]): Road;

  public abstract canBuildSettlement(player: Player): CheckResult;
  public abstract canBuildSettlement(player: Player, corner: Corner): CheckResult;
  public abstract buildSettlement(player: Player, corner: Corner): Settlement;

  public abstract canBuildCity(player: Player): CheckResult;
  public abstract canBuildCity(player: Player, corner: Corner): CheckResult;
  public abstract buildCity(player: Player, corner: Corner): City;

  // Development cards
  public abstract canBuyDevelopmentCard(player: Player): CheckResult;
  public abstract buyDevelopmentCard(player: Player): DevelopmentCard;

  public abstract canPlayDevelopmentCard(player: Player): CheckResult;
  public abstract canPlayDevelopmentCard(player: Player, card: DevelopmentCard): CheckResult;
  public abstract playDevelopmentCard(player: Player, card: DevelopmentCard): void;

  // Resources
  public abstract canCollect(player: Player): CheckResult;
  public abstract canCollect(player: Player, resources: ResourceBundle): CheckResult;
  public abstract collect(player: Player, resources: ResourceBundle): void;

  public abstract canDiscard(player: Player): CheckResult;
  public abstract canDiscard(player: Player, resources: ResourceBundle): CheckResult;
  public abstract discard(player: Player, resources: ResourceBundle): void;

  public abstract canExchange(player: Player): CheckResult;
  public abstract canExchange(
    player: Player,
    otherPlayer: Player,
    resourcesGiven: ResourceBundle,
    resourcesTaken: ResourceBundle
  ): CheckResult;
  public abstract exchange(
    player: Player,
    otherPlayer: Player,
    resourcesGiven: ResourceBundle,
    resourcesTaken: ResourceBundle
  ): void;

  public abstract canTrade(player: Player): CheckResult;
  public abstract canTrade(player: Player, resourceTaken: Resource, resourceGiven: Resource): CheckResult;
  public abstract trade(player: Player, resourceTaken: Resource, resourceGiven: Resource): void;

  // Thief
  public abstract canMoveThief(player: Player): CheckResult;
  public abstract canMoveThief(player: Player, tile: Tile, stealFrom: Player | null): CheckResult;
  public abstract moveThief(player: Player, tile: Tile, stealFrom: Player | null): void;

  // Pass turn
  public canPass(player: Player): CheckResult {
    return this.check([this.turnNotFinished(), this.isCurrentPlayer(player)]);
  }
  @check((turn: Turn, player: Player) => turn.canPass(player))
  public pass(player: Player): void {
    this.finished = true;
    this.game.advanceTurn();
  }

  // Checks
  protected check(checks: Check[]): CheckResult {
    return new Checker().addChecks(checks).run();
  }
  protected turnNotFinished(): Check {
    return {
      check: () => !this.finished,
      elseReason: CheckFailedReason.TurnFinished,
    };
  }
  protected isCurrentPlayer(player: Player): Check {
    return {
      check: () => this.player.is(player),
      elseReason: CheckFailedReason.OtherPlayersTurn,
    };
  }
}

export default Turn;
