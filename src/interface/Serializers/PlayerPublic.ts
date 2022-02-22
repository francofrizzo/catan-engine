import Player from "../../game/Dynamics/Player";
import { serializeAchievementToken } from "./AchievementToken";
import { serializeDevelopmentCard } from "./DevelopmentCard";

export const serializePlayerPlublic = (player: Player) => {
  return {
    id: player.getId(),
    name: player.getName(),
    playedDevelopmentCards: player.getPlayedDevelopmentCards().map((card) => serializeDevelopmentCard(card)),
    achievementTokens: player.getAchievementTokens().map((token) => serializeAchievementToken(token)),
    resourcesCount: player.getResourcesCount(),
    visibleVictoryPoints: player.getVisibleVictoryPoints(),
    longestRoute: player
      .getLongestRoute()
      .map((road) => road.getCorners().map((corner) => corner.getId()) as [number, number]),
  };
};
