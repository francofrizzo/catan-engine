import DevelopmentCard from "../../game/DevelopmentCards/DevelopmentCard";

export const serializeDevelopmentCard = (card: DevelopmentCard) => {
  return {
    id: card.getId(),
    victoryPoints: card.victoryPoints(),
    type: card.getType(),
    played: card.wasPlayed(),
    playable: card.isPlayable(),
  };
};
