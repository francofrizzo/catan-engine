import Tile from "./Tile";
import GameplayError from "../Dynamics/GameplayError";
import Player from "../Dynamics/Player";
import { Checker, CheckResult } from "../Checks/Checks";

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
        check: !this.position || !this.position.is(tile),
        elseReason: "THIEF_IS_ALREADY_IN_TILE",
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
          check: stealFrom === null || !player.is(stealFrom),
          elseReason: "PLAYER_CANT_STEAL_FROM_THEMSELVES",
        },
        {
          check: stealFrom === null || stealablePlayers.some((player) => player.is(stealFrom)),
          elseReason: "CANNOT_STEAL_FROM_THAT_PLAYER",
        },
        {
          check: stealablePlayers.length === 0 || stealFrom !== null,
          elseReason: "MUST_STEAL_FROM_SOME_PLAYER",
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
