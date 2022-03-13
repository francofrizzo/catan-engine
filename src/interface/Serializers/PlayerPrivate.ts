import Player from "../../game/Dynamics/Player";
import { serializeDevelopmentCard } from "./DevelopmentCard";
import { serializeResources } from "./Resources";

export const serializePlayerPrivate = (player: Player) => {
  return {
    id: player.getId(),
    allDevelopmentCards: player.getDevelopmentCards().map((card) => serializeDevelopmentCard(card)),
    resources: serializeResources(player.getResources()),
    totalVictoryPoints: player.getVictoryPoints(),
    exchangeRates: player.getExchangeRates(),
  };
};
