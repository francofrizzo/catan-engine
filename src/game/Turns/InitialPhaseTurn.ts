import Turn from "./Turn";
import { CheckResult, check } from "../Checks/Checks";
import City from "../Constructions/City";
import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Game from "../Dynamics/Game";
import GameplayError from "../Dynamics/GameplayError";
import Player from "../Dynamics/Player";
import Corner from "../Board/Corner";

export class InitialPhaseTurn extends Turn {
  private settlementBuilt: Settlement | null = null;
  private roadBuilt: Road | null = null;

  constructor(game: Game, player: Player, private stage: 1 | 2) {
    super(game, player);
  }

  public getStage(): 1 | 2 {
    return this.stage;
  }

  public canRollDice(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public rollDice(): number {
    throw new GameplayError("NOT_ALLOWED_IN_THIS_TURN");
  }

  public canBuildRoad(player: Player, [corner1, corner2]: [Corner, Corner]): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      { check: this.roadBuilt === null, elseReason: "ROAD_ALREADY_BUILT" },
      { check: this.settlementBuilt !== null, elseReason: "SETTLEMENT_NOT_BUILT" },
      player.canBuildRoad([corner1, corner2], true),
      {
        check: this.settlementBuilt!.getCorner().is(corner1) || this.settlementBuilt!.getCorner().is(corner2),
        elseReason: "ROAD_AND_SETTLEMENT_NOT_ADJACENT",
      },
    ]);
  }

  @check((turn: InitialPhaseTurn, player: Player, [corner1, corner2]: [Corner, Corner]) =>
    turn.canBuildRoad(player, [corner1, corner2])
  )
  public buildRoad(player: Player, [corner1, corner2]: [Corner, Corner]): Road {
    const road = player.buildRoad([corner1, corner2], true);
    this.roadBuilt = road;
    return road;
  }

  public canBuildSettlement(player: Player, corner: Corner): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      { check: this.settlementBuilt === null, elseReason: "SETTLEMENT_ALREADY_BUILT" },
      player.canBuildSettlement(corner, true, false),
    ]);
  }

  @check((turn: InitialPhaseTurn, player: Player, corner: Corner) => turn.canBuildSettlement(player, corner))
  public buildSettlement(player: Player, corner: Corner): Settlement {
    const settlement = player.buildSettlement(corner, true);
    this.settlementBuilt = settlement;
    return settlement;
  }

  public canBuildCity(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public buildCity(): City {
    throw new GameplayError("NOT_ALLOWED_IN_THIS_TURN");
  }

  public canBuyDevelopmentCard(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public buyDevelopmentCard(): DevelopmentCard {
    throw new GameplayError("NOT_ALLOWED_IN_THIS_TURN");
  }

  public canPlayDevelopmentCard(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public playDevelopmentCard(): void {
    throw new GameplayError("NOT_ALLOWED_IN_THIS_TURN");
  }

  public canCollect(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public collect(): void {
    throw new GameplayError("NOT_ALLOWED_IN_THIS_TURN");
  }

  public canDiscard(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public discard(): void {
    throw new GameplayError("NOT_ALLOWED_IN_THIS_TURN");
  }

  public canExchange(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public exchange(): void {
    throw new GameplayError("NOT_ALLOWED_IN_THIS_TURN");
  }

  public canTrade(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public trade(): void {
    throw new GameplayError("NOT_ALLOWED_IN_THIS_TURN");
  }

  public canMoveThief(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public moveThief(): void {
    throw new GameplayError("NOT_ALLOWED_IN_THIS_TURN");
  }

  public canPass(player: Player): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      { check: this.settlementBuilt !== null, elseReason: "SETTLEMENT_NOT_BUILT" },
      { check: this.roadBuilt !== null, elseReason: "ROAD_NOT_BUILT" },
    ]);
  }

  @check((turn: InitialPhaseTurn, player: Player) => turn.canPass(player))
  public pass(player: Player): void {
    if (this.stage === 2) {
      this.player.recieve(this.settlementBuilt!.getAdjacentResources());
    }
    super.pass(player);
  }

  // Checks

  protected notAllowedInThisTurn(): CheckResult {
    return this.check([{ check: false, elseReason: "NOT_ALLOWED_IN_THIS_TURN" }]);
  }
}

export default InitialPhaseTurn;
