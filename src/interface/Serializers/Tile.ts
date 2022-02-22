import Tile from "../../game/Board/Tile";

export const serializeTile = (tile: Tile) => {
  return {
    id: tile.getId(),
    number: tile.getNumber(),
    resource: tile.getResource(),
    corners: tile.getCorners().map((corner) => corner.getId()),
    isDesert: tile.isDesert(),
    hasThief: tile.hasThief(),
  };
};
