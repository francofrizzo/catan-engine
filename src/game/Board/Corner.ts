import Board from "./Board";
import Tile from "./Tile";
import City from "../Constructions/City";
import Construction from "../Constructions/Construction";
import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import CheckResult from "../Dynamics/CheckResult";
import Player from "../Dynamics/Player";
import ResourceBundle from "../Resources/ResourceBundle";
import Port from "../Ports/Port";

export class Corner {
  private adjacentTiles: Tile[] = [];
  private adjacentCorners: Array<{ corner: Corner; road: Road | null }> = [];
  private port: Port | null = null;
  private construction: Construction | null = null;

  constructor(private board: Board, private id: number) {}

  public is(corner: Corner): boolean;
  public is(id: number): boolean;
  public is(cornerOrId: Corner | number): boolean {
    if (typeof cornerOrId === "number") {
      return this.id === cornerOrId;
    } else {
      return this.id === cornerOrId.id;
    }
  }

  public getId(): number {
    return this.id;
  }

  public addAdjacentTiles(...tiles: Tile[]) {
    this.adjacentTiles.push(...tiles);
  }

  public addAdjacentCorners(...corners: Corner[]) {
    this.adjacentCorners.push(
      ...corners.map((corner) => ({ corner, road: null }))
    );
  }

  public addPort(port: Port) {
    this.port = port;
  }

  public hasPort(): boolean {
    return this.port !== null;
  }

  public getPort(): Port | null {
    return this.port;
  }

  public addSettlement(player: Player): Settlement {
    const settlement = new Settlement(player, this);
    this.construction = settlement;
    return settlement;
  }

  public addRoad(road: Road) {
    const otherEnd = road.getOtherEnd(this);
    const otherCorner = this.adjacentCorners.find(({ corner }) =>
      corner.is(otherEnd)
    );
    if (otherCorner) {
      otherCorner.road = road;
    } else {
      throw Error(`The corners ${this.id} and ${otherEnd.id} are not adjacent`);
    }
  }

  public addCity(player: Player): City {
    const city = new City(player, this);
    this.construction = city;
    return city;
  }

  public getAdjacentCorners(): Corner[] {
    return this.adjacentCorners.map(({ corner }) => corner);
  }

  public getAdjacentTiles(): Tile[] {
    return this.adjacentTiles;
  }

  public getAdjacentResources(): ResourceBundle {
    const resources = new ResourceBundle();
    this.adjacentTiles.forEach((tile) => {
      const resource = tile.getResource();
      if (resource) {
        resources.add(resource);
      }
    });
    return resources;
  }

  public getCollectibleResources(number: number): ResourceBundle {
    const resources = new ResourceBundle();
    this.adjacentTiles
      .filter((tile) => tile.getNumber() === number && !tile.hasThief())
      .forEach((tile) => {
        const resource = tile.getResource();
        if (resource) {
          resources.add(resource);
        }
      });
    return resources;
  }

  public getConstruction(): Construction | null {
    return this.construction;
  }

  public isOccupied(): boolean {
    return this.construction !== null;
  }

  public hasSettlement(): boolean {
    return this.construction !== null && this.construction.isSettlement();
  }

  public hasCity(): boolean {
    return this.construction !== null && this.construction.isCity();
  }

  public hasSettlementOf(player: Player): boolean {
    return (
      this.construction instanceof Settlement &&
      this.construction.getPlayer().is(player)
    );
  }

  public hasCityOf(player: Player): boolean {
    return (
      this.construction instanceof City &&
      this.construction.getPlayer().is(player)
    );
  }

  public isOccupiedBy(player: Player): boolean {
    return (
      this.construction !== null && this.construction.getPlayer().is(player)
    );
  }

  public isOccupiedByOther(player: Player): boolean {
    return (
      this.construction !== null && !this.construction.getPlayer().is(player)
    );
  }

  public isConnectedToPlayer(player: Player): boolean {
    // TODO: Check if this works well in every case
    return (
      (this.construction !== null &&
        this.construction.getPlayer().is(player)) ||
      this.adjacentCorners.some(
        ({ road }) => road && road.getPlayer().is(player)
      )
    );
  }

  public isAdjacentTo(anotherCorner: Corner) {
    return this.adjacentCorners.some(
      ({ corner }) => corner.id === anotherCorner.id
    );
  }

  public hasRoadTo(anotherCorner: Corner) {
    return this.adjacentCorners.some(
      ({ corner, road }) => corner.id === anotherCorner.id && road !== null
    );
  }

  public canAcceptRoad(player: Player, otherCorner: Corner): CheckResult {
    if (!this.isAdjacentTo(otherCorner)) {
      return {
        allowed: false,
        reason: `The corner ${this.id} is not adjacent to the corner ${otherCorner.id}`,
      };
    } else if (this.hasRoadTo(otherCorner)) {
      return {
        allowed: false,
        reason: `There is already a road between the corners ${this.id} and ${otherCorner.id}`,
      };
    } else if (this.isOccupiedByOther(player)) {
      return {
        allowed: false,
        reason: `The corner ${this.id} is already occupied by another player`,
      };
    } else {
      return { allowed: true };
    }
  }

  public canAcceptSettlement(): CheckResult {
    if (this.isOccupied()) {
      return {
        allowed: false,
        reason: `The corner ${this.id} is already occupied`,
      };
    } else if (this.adjacentCorners.some(({ corner }) => corner.isOccupied())) {
      return {
        allowed: false,
        reason: `The corner ${this.id} is adjacent to an occupied corner`,
      };
    } else {
      return { allowed: true };
    }
  }

  public canAcceptCity(
    player: Player
  ): { allowed: true } | { allowed: false; reason: string } {
    if (!this.hasSettlementOf(player)) {
      return {
        allowed: false,
        reason: `${player.getName()} doesn't have a Settlement in the corner ${
          this.id
        }`,
      };
    } else {
      return { allowed: true };
    }
  }
}

export default Corner;
