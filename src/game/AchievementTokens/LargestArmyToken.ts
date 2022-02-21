import AchievementToken from "./AchievementToken";
import Player from "../Dynamics/Player";

export class LargestArmyToken extends AchievementToken {
  public canBeAwardedTo(player: Player): boolean {
    const requiredKnights =
      this.holder === null ? 3 : this.holder.getKnightCount() + 1;
    return (
      super.canBeAwardedTo(player) && player.getKnightCount() >= requiredKnights
    );
  }

  public victoryPoints(): number {
    return 2;
  }
}

export default LargestArmyToken;
