import BoardBuilder from "./BoardBuilder";
import Corner from "./Corner";
import Thief from "./Thief";
import Tile, { DesertTile } from "./Tile";
import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import CheckResult from "../Dynamics/CheckResult";
import GameplayError from "../Dynamics/GameplayError";
import Player from "../Dynamics/Player";

export class Board {
  private tiles: Tile[] = [];
  private corners: Corner[] = [];
  private roads: Road[] = [];
  private thief: Thief = new Thief();

  constructor() {
    const boardBuilder = new BoardBuilder(3);
    boardBuilder.build(this);
    this.thief.changePositionTo(this.getDesertTile());
  }

  public setTiles(tiles: Tile[]) {
    this.tiles = tiles;
  }

  public setCorners(corners: Corner[]) {
    this.corners = corners;
  }

  public setThief(thief: Thief) {
    this.thief = thief;
  }

  public moveThief(player: Player, tileId: number, stealFrom: Player | null) {
    this.thief.moveTo(player, this.getTile(tileId), stealFrom);
  }

  public getTile(tileId: number): Tile {
    if (tileId < this.tiles.length) {
      return this.tiles[tileId];
    } else {
      throw new GameplayError(`There is no tile with id ${tileId}`);
    }
  }

  public getDesertTile(): DesertTile {
    const desertTile = this.tiles.find((tile) => tile.isDesert()) as DesertTile;
    if (desertTile) {
      return desertTile;
    } else {
      throw new Error(`There is no desert tile in the board`);
    }
  }

  public getCorner(cornerId: number): Corner {
    if (cornerId < this.corners.length) {
      return this.corners[cornerId];
    } else {
      throw new GameplayError(`There is no corner with id ${cornerId}`);
    }
  }

  public buildSettlement(
    player: Player,
    cornerId: number,
    requireConnection = true
  ): Settlement {
    const corner = this.getCorner(cornerId);
    if (requireConnection && !corner.isConnectedToPlayer(player)) {
      throw new GameplayError(
        `Can't build Settlement: corner ${cornerId} is not connected to ${player.getName()}`
      );
    } else {
      const check = corner.canAcceptSettlement();
      if (check.allowed) {
        return corner.addSettlement(player);
      } else {
        throw new GameplayError("Can't build Settlement: " + check.reason);
      }
    }
  }

  public canBuildRoad(
    player: Player,
    [corner1Id, corner2Id]: [number, number]
  ): CheckResult {
    const corner1 = this.getCorner(corner1Id);
    const corner2 = this.getCorner(corner2Id);

    if (
      !corner1.isConnectedToPlayer(player) &&
      !corner2.isConnectedToPlayer(player)
    ) {
      return {
        allowed: false,
        reason: `Neither corner ${corner1Id} nor ${corner2Id} are connected to ${player.getName()}`,
      };
    } else {
      const check1 = corner1.canAcceptRoad(player, corner2);
      if (!check1.allowed) {
        return { allowed: false, reason: check1.reason };
      } else {
        const check2 = corner2.canAcceptRoad(player, corner1);
        if (!check2.allowed) {
          return {
            allowed: false,
            reason: check2.reason,
          };
        }
      }
    }
    return { allowed: true };
  }

  public buildRoad(
    player: Player,
    [corner1Id, corner2Id]: [number, number]
  ): Road {
    const checkResult = this.canBuildRoad(player, [corner1Id, corner2Id]);
    if (checkResult.allowed) {
      const corner1 = this.getCorner(corner1Id);
      const corner2 = this.getCorner(corner2Id);
      const road = new Road(player, [corner1, corner2]);
      corner1.addRoad(road);
      corner2.addRoad(road);
      this.roads.push(road);
      return road;
    } else {
      throw new GameplayError("Can't build Road: " + checkResult.reason);
    }
  }

  public buildCity(player: Player, cornerId: number): Settlement {
    const corner = this.getCorner(cornerId);
    const check = corner.canAcceptCity(player);
    if (check.allowed) {
      return corner.addCity(player);
    } else {
      throw new GameplayError("Can't build City: " + check.reason);
    }
  }

  //   public print() {
  //     const printedBoard = `                  _____
  //                  /${this.corners[51].print()} ${this.corners[52].print()}\\
  //            _____/   ${this.tiles[18].printNumber()}  \\_____
  //           /${this.corners[49].print()} ${this.corners[50].print()}\\  ${this.tiles[18].printResource()}  /${this.corners[53].print()} ${this.corners[24].print()}\\
  //     _____/   ${this.tiles[17].printNumber()}  \\_____/   ${this.tiles[7].printNumber()}  \\_____
  //    /${this.corners[47].print()} ${this.corners[48].print()}\\  ${this.tiles[17].printResource()}  /${this.corners[22].print()} ${this.corners[23].print()}\\  ${this.tiles[7].printResource()}  /${this.corners[25].print()} ${this.corners[26].print()}\\
  //   /   ${this.tiles[16].printNumber()}  \\_____/   ${this.tiles[6].printNumber()}  \\_____/   ${this.tiles[8].printNumber()}  \\
  // ${this.corners[46].print()}\\  ${this.tiles[16].printResource()}  /${this.corners[20].print()} ${this.corners[21].print()}\\  ${this.tiles[6].printResource()}  /${this.corners[6].print()} ${this.corners[7].print()}\\  ${this.tiles[8].printResource()}  /${this.corners[27].print()}
  //    \\_____/   ${this.tiles[5].printNumber()}  \\_____/   ${this.tiles[1].printNumber()}  \\_____/
  //    /${this.corners[45].print()} ${this.corners[19].print()}\\  ${this.tiles[5].printResource()}  /${this.corners[5].print()} ${this.corners[0].print()}\\  ${this.tiles[1].printResource()}  /${this.corners[8].print()} ${this.corners[28].print()}\\
  //   /   ${this.tiles[15].printNumber()}  \\_____/   ${this.tiles[0].printNumber()}  \\_____/   ${this.tiles[9].printNumber()}  \\
  // ${this.corners[44].print()}\\  ${this.tiles[15].printResource()}  /${this.corners[18].print()} ${this.corners[4].print()}\\  ${this.tiles[0].printResource()}  /${this.corners[0].print()} ${this.corners[9].print()}\\  ${this.tiles[9].printResource()}  /${this.corners[29].print()}
  //    \\_____/   ${this.tiles[4].printNumber()}  \\_____/   ${this.tiles[2].printNumber()}  \\_____/
  //    /${this.corners[43].print()} ${this.corners[17].print()}\\  ${this.tiles[4].printResource()}  /${this.corners[3].print()} ${this.corners[2].print()}\\  ${this.tiles[2].printResource()}  /${this.corners[10].print()} ${this.corners[30].print()}\\
  //   /   ${this.tiles[14].printNumber()}  \\_____/   ${this.tiles[3].printNumber()}  \\_____/   ${this.tiles[10].printNumber()}  \\
  // ${this.corners[42].print()}\\  ${this.tiles[14].printResource()}  /${this.corners[16].print()} ${this.corners[15].print()}\\  ${this.tiles[3].printResource()}  /${this.corners[12].print()} ${this.corners[11].print()}\\  ${this.tiles[10].printResource()}  /${this.corners[31].print()}
  //    \\_____/   ${this.tiles[13].printNumber()}  \\_____/   ${this.tiles[11].printNumber()}  \\_____/
  //    ${this.corners[41].print()}  ${this.corners[40].print()}\\  ${this.tiles[13].printResource()}  /${this.corners[14].print()} ${this.corners[13].print()}\\  ${this.tiles[11].printResource()}  /${this.corners[33].print()}  ${this.corners[32].print()}
  //           \\_____/   ${this.tiles[12].printNumber()}  \\_____/
  //           ${this.corners[39].print()}  ${this.corners[38].print()}\\  ${this.tiles[12].printResource()}  /${this.corners[35].print()}  ${this.corners[34].print()}
  //                  \\_____/
  //                  ${this.corners[37].print()}   ${this.corners[36].print()}`;
  //     return printedBoard;
  //   }
}

export default Board;
