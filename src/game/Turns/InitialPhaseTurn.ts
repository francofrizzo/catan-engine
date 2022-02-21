import Turn, { checkIsCurrentPlayer, checkTurnNotFinished } from "./Turn";
import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Game from "../Dynamics/Game";
import GameplayError from "../Dynamics/GameplayError";
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

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  public buildSettlement(player: Player, cornerId: number): Settlement {
    if (!this.settlementBuilt) {
      const settlement = player.buildSettlement(cornerId, true, false);
      this.settlementBuilt = settlement;
      return settlement;
    } else {
      throw new GameplayError(
        "It is only possible to build one Settlement in this turn"
      );
    }
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  public buildRoad(
    player: Player,
    [corner1Id, corner2Id]: [number, number]
  ): Road {
    if (this.settlementBuilt === null) {
      throw new GameplayError(
        "A Settlement must be built before building a Road in this turn"
      );
    } else if (!this.roadBuilt) {
      if (
        this.settlementBuilt.getCorner().is(corner1Id) ||
        this.settlementBuilt.getCorner().is(corner2Id)
      ) {
        const road = player.buildRoad([corner1Id, corner2Id], true);
        this.roadBuilt = road;
        return road;
      } else {
        throw new GameplayError(
          "The Road and the Settlement built in this turn must be adjacent"
        );
      }
    } else {
      throw new GameplayError(
        "It is only possible to build one Road in this turn"
      );
    }
  }

  public buildCity(): Settlement {
    throw new GameplayError("It is not possible to build  a City on this turn");
  }

  public buyDevelopmentCard(): DevelopmentCard {
    throw new GameplayError(
      "It is not possible to buy a Development Card on this turn"
    );
  }

  public playDevelopmentCard(): void {
    throw new GameplayError(
      "It is not possible to play a Development Card on this turn"
    );
  }

  public exchange(): void {
    throw new GameplayError(
      "It is not possible to exchange resources on this turn"
    );
  }

  public discard(): void {
    throw new GameplayError(
      "It is not possible to discard resources on this turn"
    );
  }

  public rollDice(): number {
    throw new GameplayError("It is not possible to roll the dice on this turn");
  }

  public collect(): void {
    throw new GameplayError(
      "It is not possible to collect resources on this turn"
    );
  }

  public autoCollect(): void {
    throw new GameplayError(
      "It is not possible to collect resources on this turn"
    );
  }

  public moveThief(): void {
    throw new GameplayError(
      "It is not possible to move the thief on this turn"
    );
  }

  @checkTurnNotFinished
  @checkIsCurrentPlayer
  public pass(player: Player): void {
    if (!this.settlementBuilt) {
      throw new GameplayError("A Settlement must be built in this turn");
    }
    if (!this.roadBuilt) {
      throw new GameplayError("A Road must be built in this turn");
    } else {
      if (this.stage === 2) {
        this.player.recieve(this.settlementBuilt.getAdjacentResources());
      }
      super.pass(player);
    }
  }
}

export default InitialPhaseTurn;
