import { shuffle } from "lodash";

import DevelopmentCard from "./DevelopmentCard";
import KnightCard from "./KnightCard";
import MonopolyCard from "./MonopolyCard";
import RoadBuildingCard from "./RoadBuildingCard";
import VictoryPointCard, { VictoryPointCardType } from "./VictoryPointCard";
import YearOfPlentyCard from "./YearOfPlentyCard";
import Game from "../Dynamics/Game";

export function getDevelopmentCardDeck(game: Game): DevelopmentCard[] {
  return shuffle([
    ...Array.from({ length: 14 }, () => new KnightCard(game)),
    ...Array.from({ length: 2 }, () => new RoadBuildingCard(game)),
    ...Array.from({ length: 2 }, () => new YearOfPlentyCard(game)),
    ...Array.from({ length: 2 }, () => new MonopolyCard(game)),
    new VictoryPointCard(game, VictoryPointCardType.Chapel),
    new VictoryPointCard(game, VictoryPointCardType.GreatHall),
    new VictoryPointCard(game, VictoryPointCardType.Library),
    new VictoryPointCard(game, VictoryPointCardType.Market),
    new VictoryPointCard(game, VictoryPointCardType.University),
  ]);
}

export default getDevelopmentCardDeck;
