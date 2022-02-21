import Board from "./Board";
import Corner from "./Corner";
import Thief from "./Thief";
import Construction from "../Constructions/Construction";
import Resource from "../Resources/Resource";

export abstract class Tile {
  private corners: Corner[] = [];
  private thief: Thief | null = null;

  constructor(protected board: Board, protected id: number) {}

  public is(tile: Tile): boolean;
  public is(id: number): boolean;
  public is(tileOrId: Tile | number): boolean {
    if (typeof tileOrId === "number") {
      return this.id === tileOrId;
    } else {
      return this.id === tileOrId.id;
    }
  }

  public getId(): number {
    return this.id;
  }

  public addCorners(...corners: Corner[]) {
    this.corners.push(...corners);
  }
  public getCorners(): Corner[] {
    return this.corners;
  }

  public getAdjacentConstructions(): Construction[] {
    return this.corners
      .map((corner) => corner.getConstruction())
      .filter((construction) => construction !== null) as Construction[];
  }

  public isDesert(): this is DesertTile {
    return false;
  }

  public addThief(thief: Thief): void {
    this.thief = thief;
  }

  public removeThief(): void {
    this.thief = null;
  }

  public hasThief(): boolean {
    return this.thief !== null;
  }

  public abstract getNumber(): number | null;
  public abstract getResource(): Resource | null;
}

export class DesertTile extends Tile {
  public getNumber(): null {
    return null;
  }

  public getResource(): null {
    return null;
  }

  public isDesert(): this is DesertTile {
    return true;
  }
}

export class ResourceTile extends Tile {
  constructor(
    board: Board,
    id: number,
    private resource: Resource,
    private number: number
  ) {
    super(board, id);
  }

  public getNumber(): number {
    return this.number;
  }

  public getResource(): Resource {
    return this.resource;
  }
}

export default Tile;
