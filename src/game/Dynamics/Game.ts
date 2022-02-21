import GameplayError from "./GameplayError";
import Player from "./Player";
import AchievementToken from "../AchievementTokens/AchievementToken";
import LongestRouteToken from "../AchievementTokens/LongestRouteToken";
import LargestArmyToken from "../AchievementTokens/LargestArmyToken";
import Board from "../Board/Board";
import getDevelopmentCardDeck from "../DevelopmentCards/DeckGenerator";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Turn from "../Turns/Turn";
import InitialPhaseTurn from "../Turns/InitialPhaseTurn";
import NormalTurn from "../Turns/NormalTurn";

export class Game {
  private board: Board;
  private players: Player[];
  private developmentCardDeck: DevelopmentCard[] = getDevelopmentCardDeck(this);
  private achievementTokens: AchievementToken[] = [
    new LongestRouteToken(),
    new LargestArmyToken(),
  ];
  private winner: Player | null = null;

  private currentTurn: Turn;

  constructor() {
    this.board = new Board();
    this.players = Array.from(
      { length: 4 },
      (_, index) => new Player(this, index, `Player ${index}`)
    );
    this.currentTurn = this.getFirstTurn();
  }

  private getFirstTurn(): Turn {
    return new InitialPhaseTurn(this, this.getFirstPlayer(), 1);
  }

  private getNextTurn(turn: Turn): Turn {
    const playerId = turn.getPlayer().getId();
    if (turn instanceof InitialPhaseTurn) {
      if (turn.getStage() === 1) {
        if (!this.isSecondPlayer(playerId)) {
          return new InitialPhaseTurn(
            this,
            this.getPreviousPlayer(playerId),
            1
          );
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

  public advanceTurn(): void {
    if (this.winner === null) {
      this.currentTurn = this.getNextTurn(this.currentTurn);
    }
  }

  public win(player: Player): void {
    this.winner = player;
  }

  public getBoard(): Board {
    return this.board;
  }

  public getCurrentTurn(): Turn {
    return this.currentTurn;
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public getPlayer(id: number): Player {
    return this.players[id];
  }

  public getNextPlayer(id: number): Player {
    return id < this.players.length - 1
      ? this.players[id + 1]
      : this.players[0];
  }

  public getPreviousPlayer(id: number): Player {
    return id > 0
      ? this.players[id - 1]
      : this.players[this.players.length - 1];
  }

  public getFirstPlayer(): Player {
    return this.players[0];
  }

  public getSecondPlayer(): Player {
    return this.players[1];
  }

  public isFirstPlayer(id: number): boolean {
    return id === 0;
  }

  public isSecondPlayer(id: number): boolean {
    return id === 1;
  }

  public awardTokens(player: Player): void {
    this.achievementTokens.forEach((token) => {
      if (token.canBeAwardedTo(player)) {
        token.awardTo(player);
      }
    });
  }

  public drawDevelopmentCard(): DevelopmentCard {
    if (this.developmentCardDeck.length > 0) {
      return this.developmentCardDeck.pop()!;
    } else {
      throw new GameplayError(
        "There are no more development cards in the deck"
      );
    }
  }
}

export default Game;
