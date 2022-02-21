import Tile from "./Tile";
import Player from "../Dynamics/Player";
import Checker from "../Checks/Checker";
import { CheckResult } from "../Checks/Checks";
import { CheckFailedReason } from "../Checks/FailedChecks";

export class Thief {
  private position: Tile | null = null;

  public moveTo(player: Player, tile: Tile, stealFrom: Player | null) {
    this.changePositionTo(tile);
    if (stealFrom !== null) {
      this.steal(player, stealFrom);
    }
  }

  public canChangePositionTo(tile: Tile): CheckResult {
    return new Checker()
      .addCheck({
        check: () => !this.position || !this.position.is(tile),
        elseReason: CheckFailedReason.ThiefIsAlreadyInTile,
      })
      .run();
  }

  public canStealFrom(player: Player, tile: Tile, stealFrom: Player | null): CheckResult {
    const stealablePlayers = tile
      .getAdjacentConstructions()
      .map((construction) => construction.getPlayer())
      .filter((player) => !player.is(player) && player.getResourcesCount() > 0);
    return new Checker()
      .addChecks([
        {
          check: () => stealFrom === null || !player.is(stealFrom),
          elseReason: CheckFailedReason.PlayerCantStealFromThemselves,
        },
        {
          check: () => stealFrom === null || stealablePlayers.some((player) => player.is(stealFrom)),
          elseReason: CheckFailedReason.CannotStealFromThatPlayer,
        },
        {
          check: () => stealablePlayers.length === 0 || stealFrom !== null,
          elseReason: CheckFailedReason.MustStealFromSomePlayer,
        },
      ])
      .run();
  }

  public changePositionTo(tile: Tile) {
    if (this.position) {
      this.position.removeThief();
    }
    tile.addThief(this);
    this.position = tile;
  }

  public steal(player: Player, stealFrom: Player) {
    player.recieve(stealFrom.giveAwayRandomResource());
  }
}

export default Thief;
