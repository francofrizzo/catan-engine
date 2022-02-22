import Player from "../Dynamics/Player";
import AchievementTokenType from "./AchievementTokenType";

let tokenIds = 0;

export abstract class AchievementToken {
  private id: number = tokenIds++;
  protected holder: Player | null = null;

  public getId(): number {
    return this.id;
  }

  public abstract getType(): AchievementTokenType;

  public is(token: AchievementToken): boolean;
  public is(id: number): boolean;
  public is(tokenOrId: AchievementToken | number): boolean {
    if (typeof tokenOrId === "number") {
      return this.id === tokenOrId;
    } else {
      return this.id === tokenOrId.id;
    }
  }

  public awardTo(player: Player): void {
    if (this.holder !== null) {
      this.holder.removeAchievementToken(this);
    }
    player.addAchievementToken(this);
    this.holder = player;
  }

  public canBeAwardedTo(player: Player): boolean {
    return !this.holder || !this.holder.is(player);
  }

  public abstract victoryPoints(): number;
}

export default AchievementToken;
