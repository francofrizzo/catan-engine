import type KnightCard from "./KnightCard";
import Game from "../Dynamics/Game";
import Player from "../Dynamics/Player";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";

let cardIds = 0;

export abstract class DevelopmentCard {
  protected holder: Player | null = null;
  protected id: number = cardIds++;
  protected playable: boolean = false;
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

  public giveTo(player: Player) {
    this.holder = player;
  }

  public getHolder(): Player | null {
    return this.holder;
  }

  public markAsPlayable(): void {
    this.playable = true;
  }

  public play(): void {
    this.played = true;
  }

  public isPlayable(): boolean {
    return this.playable;
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
