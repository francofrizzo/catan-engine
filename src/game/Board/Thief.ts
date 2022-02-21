import Tile from "./Tile";
import GameplayError from "../Dynamics/GameplayError";
import Player from "../Dynamics/Player";

export class Thief {
  private position: Tile | null = null;

  public moveTo(player: Player, tile: Tile, stealFrom: Player | null) {
    this.changePositionTo(tile);
    this.steal(player, stealFrom);
  }

  public changePositionTo(tile: Tile) {
    if (this.position) {
      if (this.position.is(tile)) {
        throw new GameplayError(
          "The thief can't be moved to the same tile it is already in"
        );
      }
      this.position.removeThief();
    }
    tile.addThief(this);
    this.position = tile;
  }

  public steal(player: Player, stealFrom: Player | null) {
    if (this.position) {
      const playersToStealFrom = Array.from(
        new Set(
          this.position
            .getAdjacentConstructions()
            .map((construction) => construction.getPlayer())
        )
      );

      if (stealFrom !== null) {
        if (stealFrom.is(player)) {
          throw new GameplayError(
            `It's not possible for ${player.getName()} to steal a resource from themselves`
          );
        }
        if (
          playersToStealFrom.every((otherPlayer) => !otherPlayer.is(stealFrom))
        ) {
          throw new GameplayError(
            `It's not possible for ${player.getName()} to steal a resource from ${stealFrom.getName()}`
          );
        }
        player.recieve(stealFrom.stealRandomResource());
      } else {
        if (playersToStealFrom.length > 0) {
          throw new GameplayError(
            `It is necessary to steal a resource from some player`
          );
        }
      }
    } else {
      throw Error("The thief is not positioned on the board");
    }
  }
}

export default Thief;
