import Corner from "../../game/Board/Corner";
import { serializeConstruction } from "./Construction";
import { serializePort } from "./Port";

export const serializeCorner = (corner: Corner) => {
  return {
    id: corner.getId(),
    adjacentCorners: corner.getAdjacentCorners().map((corner) => corner.getId()),
    adjacentTiles: corner.getAdjacentTiles().map((tile) => tile.getId()),
    roads: corner.getRoads().map((road) => ({ to: road.getOtherEnd(corner), player: road.getPlayer().getId() })),
    port: corner.hasPort() ? serializePort(corner.getPort()!) : null,
    construction: corner.isOccupied() ? serializeConstruction(corner.getConstruction()!) : null,
  };
};
