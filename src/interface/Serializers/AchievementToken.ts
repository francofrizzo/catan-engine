import AchievementToken from "../../game/AchievementTokens/AchievementToken";

export const serializeAchievementToken = (token: AchievementToken) => {
  return {
    id: token.getId(),
    type: token.getType(),
    victoryPoints: token.victoryPoints(),
  };
};
