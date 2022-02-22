import AchievementToken from "./AchievementToken";
import Player from "../Dynamics/Player";
import AchievementTokenType from "./AchievementTokenType";

export class LongestRouteToken extends AchievementToken {
  public getType(): AchievementTokenType {
    return AchievementTokenType.LongestRoute;
  }

  public canBeAwardedTo(player: Player): boolean {
    const requiredRoads = this.holder === null ? 5 : this.holder.getLongestRoute().length + 1;
    return super.canBeAwardedTo(player) && player.getLongestRoute().length >= requiredRoads;
  }

  public victoryPoints(): number {
    return 2;
  }
}

export default LongestRouteToken;
