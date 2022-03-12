import { CheckFailedError, CheckFailedReason } from "./Checks/FailedChecks";
import { DevelopmentCardType, VictoryPointCardType } from "./DevelopmentCards/DevelopmentCardType";
import { GameplayError, GameplayErrorReason } from "./GameplayError/GameplayError";
import AchievementToken from "./AchievementTokens/AchievementToken";
import AchievementTokenType from "./AchievementTokens/AchievementTokenType";
import Board from "./Board/Board";
import City from "./Constructions/City";
import Construction from "./Constructions/Construction";
import Corner from "./Board/Corner";
import DevelopmentCard from "./DevelopmentCards/DevelopmentCard";
import Game, { GameOptions } from "./Dynamics/Game";
import InitialPhaseTurn from "./Turns/InitialPhaseTurn";
import KnightCard from "./DevelopmentCards/KnightCard";
import LargestArmyToken from "./AchievementTokens/LargestArmyToken";
import LongestRouteToken from "./AchievementTokens/LongestRouteToken";
import MonopolyCard from "./DevelopmentCards/MonopolyCard";
import NormalTurn from "./Turns/NormalTurn";
import OpenPort from "./Ports/OpenPort";
import Player from "./Dynamics/Player";
import Port from "./Ports/Port";
import Resource from "./Resources/Resource";
import ResourceBundle from "./Resources/ResourceBundle";
import ResourcePort from "./Ports/ResourcePort";
import Road from "./Constructions/Road";
import RoadBuildingCard from "./DevelopmentCards/RoadBuildingCard";
import Settlement from "./Constructions/Settlement";
import Thief from "./Board/Thief";
import Tile, { DesertTile, ResourceTile } from "./Board/Tile";
import Turn from "./Turns/Turn";
import VictoryPointCard from "./DevelopmentCards/VictoryPointCard";
import YearOfPlentyCard from "./DevelopmentCards/YearOfPlentyCard";

export const isCatanError = (err: unknown): err is CheckFailedError | GameplayError =>
  typeof err === "object" && (err instanceof CheckFailedError || err instanceof GameplayError);

export {
  AchievementToken,
  AchievementTokenType,
  Board,
  CheckFailedError,
  CheckFailedReason,
  City,
  Construction,
  Corner,
  DesertTile,
  DevelopmentCard,
  DevelopmentCardType,
  Game,
  GameOptions,
  GameplayError,
  GameplayErrorReason,
  InitialPhaseTurn,
  KnightCard,
  LargestArmyToken,
  LongestRouteToken,
  MonopolyCard,
  NormalTurn,
  OpenPort,
  Player,
  Port,
  Resource,
  ResourceBundle,
  ResourcePort,
  ResourceTile,
  Road,
  RoadBuildingCard,
  Settlement,
  Thief,
  Tile,
  Turn,
  VictoryPointCard,
  VictoryPointCardType,
  YearOfPlentyCard,
};
