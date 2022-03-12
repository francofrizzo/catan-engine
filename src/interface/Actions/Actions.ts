import Corner from "../../game/Board/Corner";
import Tile from "../../game/Board/Tile";
import { CheckResult } from "../../game/Checks/Checks";
import DevelopmentCard from "../../game/DevelopmentCards/DevelopmentCard";
import Player from "../../game/Dynamics/Player";
import Resource from "../../game/Resources/Resource";
import ResourceBundle from "../../game/Resources/ResourceBundle";
import Turn from "../../game/Turns/Turn";

export type ResourceCollection = { [K in Resource]?: number };

type ActionRegistry = {
  RollDice: {
    arguments: [];
    jsonArguments: {};
  };
  BuildRoad: {
    arguments: [[Corner, Corner]];
    jsonArguments: { corners: [number, number] };
  };
  BuildSettlement: {
    arguments: [Corner];
    jsonArguments: { corner: number };
  };
  BuildCity: {
    arguments: [Corner];
    jsonArguments: { corner: number };
  };
  BuyDevelopmentCard: {
    arguments: [];
    jsonArguments: {};
  };
  PlayDevelopmentCard: {
    arguments: [DevelopmentCard];
    jsonArguments: { card: number };
  };
  Collect: {
    arguments: [ResourceBundle];
    jsonArguments: { resources: ResourceCollection };
  };
  Discard: {
    arguments: [ResourceBundle];
    jsonArguments: { resources: ResourceCollection };
  };
  Exchange: {
    arguments: [Player, ResourceBundle, ResourceBundle];
    jsonArguments: { otherPlayer: number; resourcesGiven: ResourceCollection; resourcesTaken: ResourceCollection };
  };
  Trade: {
    arguments: [Resource, Resource];
    jsonArguments: { resourceGiven: Resource; resourceTaken: Resource };
  };
  MoveThief: {
    arguments: [Tile, Player | null];
    jsonArguments: { tile: number; stealFrom: number | null };
  };
  Pass: {
    arguments: [];
    jsonArguments: {};
  };
};

export type Action = keyof ActionRegistry;
export type ActionArguments<A extends Action> = ActionRegistry[A]["arguments"];
export type ActionJsonArguments<A extends Action> = ActionRegistry[A]["jsonArguments"];

export const actionChecks = (turn: Turn): { [A in Action]: (this: Turn, player: Player) => CheckResult } => ({
  RollDice: turn.canRollDice,
  BuildRoad: turn.canBuildRoad,
  BuildSettlement: turn.canBuildSettlement,
  BuildCity: turn.canBuildCity,
  BuyDevelopmentCard: turn.canBuyDevelopmentCard,
  PlayDevelopmentCard: turn.canPlayDevelopmentCard,
  Collect: turn.canCollect,
  Discard: turn.canDiscard,
  Exchange: turn.canExchange,
  Trade: turn.canTrade,
  MoveThief: turn.canMoveThief,
  Pass: turn.canPass,
});

export const actionMethods = (
  turn: Turn
): { [A in Action]: (this: Turn, player: Player, ...args: ActionArguments<A>) => any } => ({
  RollDice: turn.rollDice,
  BuildRoad: turn.buildRoad,
  BuildSettlement: turn.buildSettlement,
  BuildCity: turn.buildCity,
  BuyDevelopmentCard: turn.buyDevelopmentCard,
  PlayDevelopmentCard: turn.playDevelopmentCard,
  Collect: turn.collect,
  Discard: turn.discard,
  Exchange: turn.exchange,
  Trade: turn.trade,
  MoveThief: turn.moveThief,
  Pass: turn.pass,
});
