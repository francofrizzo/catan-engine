import type KnightCard from "./KnightCard";
import Game from "../Dynamics/Game";
import Player from "../Dynamics/Player";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";
import Turn from "../Turns/Turn";
import { Checker, CheckResult } from "../Checks/Checks";

let cardIds = 0;

export abstract class DevelopmentCard {
  protected holder: Player | null = null;
  protected turnDrawn: Turn | null = null;
  protected id: number = cardIds++;
  protected played: boolean = false;

  constructor(protected game: Game) {}

  public getId(): number {
    return this.id;
  }

  public is(card: DevelopmentCard): boolean;
  public is(id: number): boolean;
  public is(cardOrId: DevelopmentCard | number): boolean {
    if (typeof cardOrId === "number") {
      return this.id === cardOrId;
    } else {
      return this.id === cardOrId.id;
    }
  }

  public giveTo(player: Player, turn: Turn) {
    this.holder = player;
    this.turnDrawn = turn;
  }

  public getHolder(): Player | null {
    return this.holder;
  }

  public canBePlayed(): CheckResult {
    return new Checker()
      .addChecks([
        {
          check: !this.played,
          elseReason: "CARD_ALREADY_PLAYED",
        },
        {
          check: this.holder !== null,
          elseReason: "CARD_HAS_NO_HOLDER",
        },
        {
          check: this.turnDrawn !== null && this.turnDrawn.hasFinished(),
          elseReason: "CARD_DRAWN_IN_THIS_TURN",
        },
      ])
      .run();
  }

  public play(): void {
    this.played = true;
  }

  public wasPlayed(): boolean {
    return this.played;
  }

  public isKnight(): this is KnightCard {
    return false;
  }

  public abstract victoryPoints(): number;

  public static cost(): ResourceBundle {
    return new ResourceBundle({
      [Resource.Grain]: 1,
      [Resource.Ore]: 1,
      [Resource.Wool]: 1,
    });
  }
}

export default DevelopmentCard;
