import Player from "./Player";
import AchievementToken from "../AchievementTokens/AchievementToken";
import LongestRouteToken from "../AchievementTokens/LongestRouteToken";
import LargestArmyToken from "../AchievementTokens/LargestArmyToken";
import Board from "../Board/Board";
import Checker from "../Checks/Checker";
import { CheckResult } from "../Checks/Checks";
import { CheckFailedReason } from "../Checks/FailedChecks";
import getDevelopmentCardDeck from "../DevelopmentCards/DeckGenerator";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Turn from "../Turns/Turn";
import InitialPhaseTurn from "../Turns/InitialPhaseTurn";
import NormalTurn from "../Turns/NormalTurn";
import { GameplayError, GameplayErrorReason } from "../GameplayError/GameplayError";

export interface GameOptions {
  playerNames: [string, string, string] | [string, string, string, string];
  autoCollect: boolean;
}

export class Game {
  protected board: Board;
  protected players: Player[];
  protected allDevelopmentCards: DevelopmentCard[];
  protected developmentCardDeck: DevelopmentCard[];
  protected achievementTokens: AchievementToken[] = [new LongestRouteToken(), new LargestArmyToken()];

  protected currentTurn: Turn;
  protected winner: Player | null = null;

  constructor(protected options: GameOptions) {
    this.board = new Board();
    this.players = this.options.playerNames.map((name, index) => new Player(this, index, name));
    this.allDevelopmentCards = getDevelopmentCardDeck(this);
    this.developmentCardDeck = this.allDevelopmentCards;
    this.currentTurn = this.buildFirstTurn();
  }

  // Options

  public getOptions(): GameOptions {
    return this.options;
  }

  // Board

  public getBoard(): Board {
    return this.board;
  }

  // Turns

  public getCurrentTurn(): Turn {
    return this.currentTurn;
  }

  public advanceTurn(): void {
    if (this.winner === null) {
      this.currentTurn = this.buildNextTurn(this.currentTurn);
    }
  }

  protected buildFirstTurn(): Turn {
    return new InitialPhaseTurn(this, this.getFirstPlayer(), 1);
  }

  protected buildNextTurn(turn: Turn): Turn {
    const playerId = turn.getPlayer().getId();
    if (turn instanceof InitialPhaseTurn) {
      if (turn.getStage() === 1) {
        if (!this.isSecondPlayer(playerId)) {
          return new InitialPhaseTurn(this, this.getPreviousPlayer(playerId), 1);
        } else {
          return new InitialPhaseTurn(this, this.getSecondPlayer(), 2);
        }
      } else {
        if (!this.isFirstPlayer(playerId)) {
          return new InitialPhaseTurn(this, this.getNextPlayer(playerId), 2);
        } else {
          return new NormalTurn(this, this.getFirstPlayer());
        }
      }
    }
    return new NormalTurn(this, this.getNextPlayer(playerId));
  }

  public win(player: Player): void {
    this.winner = player;
  }

  // Players

  public getPlayers(): Player[] {
    return this.players;
  }

  public getPlayer(id: number): Player {
    if (id < this.players.length) {
      return this.players[id];
    } else {
      throw new GameplayError(GameplayErrorReason.InvalidPlayerId);
    }
  }

  protected getNextPlayer(id: number): Player {
    return id < this.players.length - 1 ? this.players[id + 1] : this.players[0];
  }

  protected getPreviousPlayer(id: number): Player {
    return id > 0 ? this.players[id - 1] : this.players[this.players.length - 1];
  }

  protected getFirstPlayer(): Player {
    return this.players[0];
  }

  protected getSecondPlayer(): Player {
    return this.players[1];
  }

  protected isFirstPlayer(id: number): boolean {
    return id === 0;
  }

  protected isSecondPlayer(id: number): boolean {
    return id === 1;
  }

  // Tokens and cards

  public getAchievementTokens(): AchievementToken[] {
    return this.achievementTokens;
  }

  public awardTokensToPlayer(player: Player): void {
    this.achievementTokens.forEach((token) => {
      if (token.canBeAwardedTo(player)) {
        token.awardTo(player);
      }
    });
  }

  public getDevelopmentCardsDeckSize(): number {
    return this.developmentCardDeck.length;
  }

  public getDevelopmentCard(cardId: number): DevelopmentCard {
    const card = this.allDevelopmentCards.find((card) => card.is(cardId));
    if (card !== undefined) {
      return card;
    } else {
      throw new GameplayError(GameplayErrorReason.InvalidDevelopmentCardId);
    }
  }

  public canDrawDevelopmentCard(): CheckResult {
    return new Checker()
      .addCheck({
        check: () => this.developmentCardDeck.length > 0,
        elseReason: CheckFailedReason.EmptyDeck,
      })
      .run();
  }

  public drawDevelopmentCard(): DevelopmentCard {
    if (this.developmentCardDeck.length > 0) {
      return this.developmentCardDeck.pop()!;
    } else {
      throw new GameplayError(GameplayErrorReason.EmptyDeck);
    }
  }
}

export default Game;
