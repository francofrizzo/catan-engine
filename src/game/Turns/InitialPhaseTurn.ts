import Turn from "./Turn";
import Corner from "../Board/Corner";
import { CheckResult, check } from "../Checks/Checks";
import { CheckFailedError, CheckFailedReason } from "../Checks/FailedChecks";
import City from "../Constructions/City";
import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Game from "../Dynamics/Game";
import Player from "../Dynamics/Player";

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
    throw new CheckFailedError(CheckFailedReason.NotAllowedInThisTurn);
  }

  public canBuildRoad(player: Player, [corner1, corner2]: [Corner, Corner]): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      { check: () => this.roadBuilt === null, elseReason: CheckFailedReason.RoadAlreadyBuilt },
      { check: () => this.settlementBuilt !== null, elseReason: CheckFailedReason.SettlementNotBuilt },
      () => player.canBuildRoad([corner1, corner2], true),
      {
        check: () => this.settlementBuilt!.getCorner().is(corner1) || this.settlementBuilt!.getCorner().is(corner2),
        elseReason: CheckFailedReason.RoadAndSettlementNotAdjacent,
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
      { check: () => this.settlementBuilt === null, elseReason: CheckFailedReason.SettlementAlreadyBuilt },
      () => player.canBuildSettlement(corner, true, false),
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
    throw new CheckFailedError(CheckFailedReason.NotAllowedInThisTurn);
  }

  public canBuyDevelopmentCard(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public buyDevelopmentCard(): DevelopmentCard {
    throw new CheckFailedError(CheckFailedReason.NotAllowedInThisTurn);
  }

  public canPlayDevelopmentCard(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public playDevelopmentCard(): void {
    throw new CheckFailedError(CheckFailedReason.NotAllowedInThisTurn);
  }

  public canCollect(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public collect(): void {
    throw new CheckFailedError(CheckFailedReason.NotAllowedInThisTurn);
  }

  public canDiscard(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public discard(): void {
    throw new CheckFailedError(CheckFailedReason.NotAllowedInThisTurn);
  }

  public canExchange(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public exchange(): void {
    throw new CheckFailedError(CheckFailedReason.NotAllowedInThisTurn);
  }

  public canTrade(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public trade(): void {
    throw new CheckFailedError(CheckFailedReason.NotAllowedInThisTurn);
  }

  public canMoveThief(): CheckResult {
    return this.notAllowedInThisTurn();
  }

  public moveThief(): void {
    throw new CheckFailedError(CheckFailedReason.NotAllowedInThisTurn);
  }

  public canPass(player: Player): CheckResult {
    return this.check([
      this.turnNotFinished(),
      this.isCurrentPlayer(player),
      { check: () => this.settlementBuilt !== null, elseReason: CheckFailedReason.SettlementNotBuilt },
      { check: () => this.roadBuilt !== null, elseReason: CheckFailedReason.RoadNotBuilt },
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
    return this.check([{ check: () => false, elseReason: CheckFailedReason.NotAllowedInThisTurn }]);
  }
}

export default InitialPhaseTurn;
