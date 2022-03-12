import Game from "../../game/Dynamics/Game";
import ResourceBundle from "../../game/Resources/ResourceBundle";
import { Action, ActionArguments, ActionJsonArguments } from "../Actions/Actions";

export const actionArgumentParsers = (
  game: Game
): { [A in Action]: (jsonArgs: ActionJsonArguments<A>) => ActionArguments<A> } => ({
  RollDice: () => [],
  BuildRoad: ({ corners }) => [[game.getBoard().getCorner(corners[0]), game.getBoard().getCorner(corners[1])]],
  BuildSettlement: ({ corner }) => [game.getBoard().getCorner(corner)],
  BuildCity: ({ corner }) => [game.getBoard().getCorner(corner)],
  BuyDevelopmentCard: () => [],
  PlayDevelopmentCard: ({ card }) => [game.getDevelopmentCard(card)],
  Collect: ({ resources }) => [new ResourceBundle(resources)],
  Discard: ({ resources }) => [new ResourceBundle(resources)],
  Exchange: ({ otherPlayer, resourcesGiven, resourcesTaken }) => [
    game.getPlayer(otherPlayer),
    new ResourceBundle(resourcesGiven),
    new ResourceBundle(resourcesTaken),
  ],
  Trade: ({ resourceGiven, resourceTaken }) => [resourceGiven, resourceTaken],
  MoveThief: ({ tile, stealFrom }) => [
    game.getBoard().getTile(tile),
    stealFrom !== null ? game.getPlayer(stealFrom) : null,
  ],
  Pass: () => [],
});

export default actionArgumentParsers;
