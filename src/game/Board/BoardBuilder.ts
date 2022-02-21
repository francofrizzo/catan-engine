import shuffle from "lodash/shuffle";

import Board from "./Board";
import Corner from "./Corner";
import Tile, { ResourceTile, DesertTile } from "./Tile";
import Resource from "../Resources/Resource";
import Port from "../Ports/Port";
import OpenPort from "../Ports/OpenPort";
import ResourcePort from "../Ports/ResourcePort";

type CornerDescription = {
  index: number;
  layer: number;
  adjacentCorners: number[];
  adjacentTiles: number[];
};

type ProvisionalCornerDescription = Omit<CornerDescription, "adjacentTiles">;

type TileDescription = {
  index: number;
  layer: number;
  corners: number[];
};

const mod = (n: number, m: number): number => ((n % m) + m) % m;

const sliceRound = <T>(arr: T[], start: number, count: number): T[] => {
  const actualStart = mod(start, arr.length);
  return actualStart + count <= arr.length
    ? arr.slice(actualStart, actualStart + count)
    : [
        ...arr.slice(actualStart),
        ...arr.slice(0, actualStart + count - arr.length),
      ];
};

export class BoardBuilder {
  private cornerDescriptions: CornerDescription[];
  private tileDescriptions: TileDescription[];

  constructor(private layerCount: number) {
    const provisionalCornerDescriptions = this.buildCornerDescriptions();
    this.tileDescriptions = this.buildTileDescriptions(
      provisionalCornerDescriptions
    );
    this.cornerDescriptions = this.addAdjacentTilesToCornerDescriptions(
      provisionalCornerDescriptions,
      this.tileDescriptions
    );
  }

  public build(board: Board) {
    const tiles = this.buildTiles(board);
    const corners = this.buildCorners(board);
    this.addCornersToTiles(tiles, corners);
    this.addAdjacentTilesAndCornersToCorners(corners, tiles);

    board.setTiles(tiles);
    board.setCorners(corners);
  }

  private buildCorners(board: Board): Corner[] {
    const ports = this.getPorts();
    return this.cornerDescriptions.map((cornerDescription, index) => {
      const port = ports[index];
      const corner = new Corner(board, index);
      if (port !== null) {
        corner.addPort(port);
      }
      return corner;
    });
  }

  private buildTiles(board: Board): Tile[] {
    const numbers = this.getTileNumbers();
    const resources = this.getResources();
    let numberIndex = 0;

    return this.tileDescriptions.map((tileDescription, index) => {
      const resource = resources[index];
      if (resource !== null) {
        const tile = new ResourceTile(
          board,
          index,
          resource,
          numbers[numberIndex]
        );
        numberIndex++;
        return tile;
      } else {
        return new DesertTile(board, index);
      }
    });
  }

  private addCornersToTiles(tiles: Tile[], corners: Corner[]): void {
    tiles.forEach((tile, tileIndex) => {
      const tileDescription = this.tileDescriptions[tileIndex];
      tile.addCorners(
        ...tileDescription.corners.map((cornerIndex) => corners[cornerIndex])
      );
    });
  }

  private addAdjacentTilesAndCornersToCorners(
    corners: Corner[],
    tiles: Tile[]
  ): void {
    corners.forEach((corner, cornerIndex) => {
      const cornerDescription = this.cornerDescriptions[cornerIndex];
      corner.addAdjacentTiles(
        ...cornerDescription.adjacentTiles.map((tileIndex) => tiles[tileIndex])
      );
      corner.addAdjacentCorners(
        ...cornerDescription.adjacentCorners.map(
          (otherCornerIndex) => corners[otherCornerIndex]
        )
      );
    });
  }

  private buildCornerDescriptions(): ProvisionalCornerDescription[] {
    const layerSize = (layerNumber: number) => 6 * (2 * layerNumber + 1);
    const isExternalForLayer = (relativeIndex: number, layerNumber: number) =>
      ((relativeIndex + layerNumber) % (2 * layerNumber + 1)) % 2 === 0;

    const layers: ProvisionalCornerDescription[][] = [];
    let lastCornerIndex = 0;
    let previousLayerExternalCorners: ProvisionalCornerDescription[] = [];
    for (let n = 0; n < this.layerCount; n++) {
      const size = layerSize(n);
      const corners: ProvisionalCornerDescription[] = [];
      const externalCorners: ProvisionalCornerDescription[] = [];
      let internalCornerIndex = 0;
      for (let i = 0; i < size; i++) {
        const corner: ProvisionalCornerDescription = {
          index: lastCornerIndex + i,
          layer: n,
          adjacentCorners: [
            lastCornerIndex + mod(i - 1, size),
            lastCornerIndex + mod(i + 1, size),
          ],
        };
        if (isExternalForLayer(i, n)) {
          externalCorners.push(corner);
        } else {
          previousLayerExternalCorners[
            internalCornerIndex
          ].adjacentCorners.push(lastCornerIndex + i);
          corner.adjacentCorners.unshift(
            previousLayerExternalCorners[internalCornerIndex].index
          );
          internalCornerIndex++;
        }
        corners.push(corner);
      }
      lastCornerIndex += size;
      previousLayerExternalCorners = externalCorners;
      layers.push(corners);
    }
    return ([] as ProvisionalCornerDescription[]).concat(...layers);
  }

  private buildTileDescriptions(
    cornerDescriptions: ProvisionalCornerDescription[]
  ): TileDescription[] {
    const cornersByLayer = Array.from(
      { length: this.layerCount },
      (_, layerIndex) =>
        cornerDescriptions
          .filter(({ layer }) => layer === layerIndex)
          .map(({ index }) => index)
    );

    const layerSize = (layerIndex: number) =>
      layerIndex > 0 ? 6 * layerIndex : 1;

    const layers: TileDescription[][] = [];
    let lastTileIndex = 0;

    for (let n = 0; n < this.layerCount; n++) {
      const size = layerSize(n);
      const tiles: TileDescription[] = [];
      let previousLayerCurrentCornerIndex = n > 0 ? 1 - n : 0;
      let thisLayerCurrentCornerIndex = previousLayerCurrentCornerIndex;
      for (let i = 0; i < size; i++) {
        const tile: TileDescription = {
          index: lastTileIndex + i,
          layer: n,
          corners: [],
        };
        if (n === 0) {
          tile.corners.push(...cornersByLayer[0]);
        } else {
          const isCornerTile = i % n === n - 1;
          tile.corners.push(
            ...sliceRound(
              cornersByLayer[n - 1],
              previousLayerCurrentCornerIndex,
              isCornerTile ? 2 : 3
            ),
            ...sliceRound(
              cornersByLayer[n],
              thisLayerCurrentCornerIndex,
              isCornerTile ? 4 : 3
            )
          );
          previousLayerCurrentCornerIndex += isCornerTile ? 1 : 2;
          thisLayerCurrentCornerIndex += isCornerTile ? 3 : 2;
        }
        tiles.push(tile);
      }
      lastTileIndex += size;
      layers.push(tiles);
    }
    return ([] as TileDescription[]).concat(...layers);
  }

  private addAdjacentTilesToCornerDescriptions(
    cornerDescriptions: ProvisionalCornerDescription[],
    tileDescriptions: TileDescription[]
  ): CornerDescription[] {
    const adjacentTilesForCorners: number[][] = Array.from(
      { length: cornerDescriptions.length },
      () => []
    );
    tileDescriptions.forEach(({ corners }, tileIndex) => {
      corners.forEach((cornerIndex) =>
        adjacentTilesForCorners[cornerIndex].push(tileIndex)
      );
    });
    return cornerDescriptions.map((description, index) => ({
      ...description,
      adjacentTiles: adjacentTilesForCorners[index],
    }));
  }

  private getTileNumbers(): number[] {
    if (this.layerCount === 3) {
      return [11, 3, 6, 5, 4, 9, 10, 8, 4, 11, 12, 9, 10, 8, 3, 6, 2, 5];
    } else {
      throw Error(
        `Cannot compute tile numbers for a board of size ${this.layerCount}`
      );
    }
  }

  private getResources(): (Resource | null)[] {
    if (this.layerCount === 3) {
      return shuffle([
        Resource.Grain,
        Resource.Grain,
        Resource.Grain,
        Resource.Grain,
        Resource.Lumber,
        Resource.Lumber,
        Resource.Lumber,
        Resource.Lumber,
        Resource.Wool,
        Resource.Wool,
        Resource.Wool,
        Resource.Wool,
        Resource.Brick,
        Resource.Brick,
        Resource.Brick,
        Resource.Ore,
        Resource.Ore,
        Resource.Ore,
        null,
      ]);
    } else {
      throw Error(
        `Cannot compute resources for a board of size ${this.layerCount}`
      );
    }
  }

  private getPorts(): (Port | null)[] {
    if (this.layerCount === 3) {
      const ports: (Port | null)[] = Array.from(
        { length: this.cornerDescriptions.length },
        () => null
      );
      ports[24] = new ResourcePort(2, Resource.Wool);
      ports[25] = new ResourcePort(2, Resource.Wool);
      ports[28] = new OpenPort(3);
      ports[29] = new OpenPort(3);
      ports[31] = new OpenPort(3);
      ports[32] = new OpenPort(3);
      ports[34] = new ResourcePort(2, Resource.Brick);
      ports[35] = new ResourcePort(2, Resource.Brick);
      ports[38] = new ResourcePort(2, Resource.Lumber);
      ports[39] = new ResourcePort(2, Resource.Lumber);
      ports[41] = new OpenPort(3);
      ports[42] = new OpenPort(3);
      ports[44] = new ResourcePort(2, Resource.Grain);
      ports[45] = new ResourcePort(2, Resource.Grain);
      ports[48] = new ResourcePort(2, Resource.Ore);
      ports[49] = new ResourcePort(2, Resource.Ore);
      ports[51] = new OpenPort(3);
      ports[52] = new OpenPort(3);
      return ports;
    } else {
      throw Error(
        `Cannot compute ports for a board of size ${this.layerCount}`
      );
    }
  }
}

export default BoardBuilder;
