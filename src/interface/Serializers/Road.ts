import Road from "../../game/Constructions/Road";

export const serializeRoad = (road: Road) => {
  return {
    player: road.getPlayer(),
    corners: road.getCorners().map((corner) => corner.getId()) as [number, number],
  };
};
