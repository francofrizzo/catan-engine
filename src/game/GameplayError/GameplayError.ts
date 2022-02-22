export enum GameplayErrorReason {
  CornersNotAdjacent = "CORNERS_NOT_ADJACENT",
  CornerDoesntBelongToRoad = "CORNER_DOESNT_BELONG_TO_ROAD",
  UndefinedDevelopmentCardArguments = "UNDEFINED_DEVELOPMENT_CARD_ARGUMENTS",
  AchievementTokenNotOwnedByPlayer = "ACHIEVEMENT_TOKEN_NOT_OWNED_BY_PLAYER",
  InvalidTileId = "INVALID_TILE_ID",
  InvalidCornerId = "INVALID_CORNER_ID",
  InvalidPlayerId = "INVALID_PLAYER_ID",
  InvalidDevelopmentCardId = "INVALID_DEVELOPMENT_CARD_ID",
  EmptyDeck = "EMPTY_DECK",
  NoDesertTile = "NO_DESERT_TILE",
  VictoryPointCardIsNotPlayable = "VICTORY_POINT_CARD_IS_NOT_PLAYABLE",
  DiceNotRolled = "DICE_NOT_ROLLED",
  NotEnoughResources = "NOT_ENOUGH_RESOURCES",
}

export class GameplayError extends Error {}
