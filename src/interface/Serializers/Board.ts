import Board from "../../game/Board/Board";
import { serializeCorner } from "./Corner";
import { serializeRoad } from "./Road";
import { serializeTile } from "./Tile";

export const serializeBoard = (board: Board) => {
  return {
    tiles: board.getTiles().map((tile) => serializeTile(tile)),
    corners: board.getCorners().map((corner) => serializeCorner(corner)),
    roads: board.getRoads().map((road) => serializeRoad(road)),
  };
};
