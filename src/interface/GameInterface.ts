import { isCatanError } from "../game";
import { CheckFailedError } from "../game/Checks/FailedChecks";
import Game, { GameOptions } from "../game/Dynamics/Game";
import Player from "../game/Dynamics/Player";
import { GameplayError } from "../game/GameplayError/GameplayError";
import { Action, actionChecks, actionMethods, ActionArguments, ActionJsonArguments } from "./Actions/Actions";
import actionArgumentParsers from "./ArgumentParsers/ArgumentParsers";
import { serializeGame } from "./Serializers/Game";
import { serializePlayerPrivate } from "./Serializers/PlayerPrivate";

export type ActionCallback = <A extends Action>(
  gameInterface: GameInterface,
  action: A,
  player: Player,
  args: ActionJsonArguments<A>,
  parsedArgs: ActionArguments<A>
) => unknown;

export type ArgumentParseErrorCallback = <A extends Action>(
  error: any,
  gameInterface: GameInterface,
  action: A,
  player: Player,
  args: ActionJsonArguments<A>
) => unknown;

export type ActionErrorCallback = <A extends Action>(
  error: CheckFailedError | GameplayError,
  gameInterface: GameInterface,
  action: A,
  player: Player,
  args: ActionJsonArguments<A>,
  parsedArgs: ActionArguments<A>
) => unknown;

export class GameInterface {
  protected game: Game;
  protected callbacks = {
    beforeAction: [] as ActionCallback[],
    afterAction: [] as ActionCallback[],
    onActionError: [] as ActionErrorCallback[],
    onArgumentParseError: [] as ArgumentParseErrorCallback[],
  };

  constructor(options: GameOptions) {
    this.game = new Game(options);
  }

  public getPublicState() {
    return serializeGame(this.game);
  }

  public getPrivateState(playerId: number) {
    return serializePlayerPrivate(this.game.getPlayer(playerId));
  }

  public beforeAction(callback: ActionCallback): void {
    this.callbacks.beforeAction.push(callback);
  }

  public afterAction(callback: ActionCallback): void {
    this.callbacks.afterAction.push(callback);
  }

  public onActionError(callback: ActionErrorCallback): void {
    this.callbacks.onActionError.push(callback);
  }

  public onArgumentParseError(callback: ArgumentParseErrorCallback): void {
    this.callbacks.onActionError.push(callback);
  }

  public getAvailableActions(playerId: number): Action[] {
    const turn = this.game.getCurrentTurn();
    const player = this.game.getPlayer(playerId);
    const checks = actionChecks(turn);
    return Object.entries(checks)
      .filter(([_, isAvailable]) => isAvailable.call(turn, player).value)
      .map(([action]) => action as Action);
  }

  public executeAction<A extends Action>(playerId: number, action: A, args: ActionJsonArguments<A>): void {
    const turn = this.game.getCurrentTurn();
    const player = this.game.getPlayer(playerId);

    const parsedArgs = this.parseActionArguments(player, action, args);
    if (parsedArgs === undefined) {
      return;
    }

    const method = actionMethods(turn)[action];
    try {
      this.callbacks.beforeAction.forEach((callback) => callback(this, action, player, args, parsedArgs));
      (method as any).apply(turn, [player, ...parsedArgs]);
      this.callbacks.afterAction.forEach((callback) => callback(this, action, player, args, parsedArgs));
    } catch (err: any) {
      if (isCatanError(err)) {
        this.callbacks.onActionError.forEach((callback) => callback(err, this, action, player, args, parsedArgs));
      }
      throw err;
    }
  }

  protected parseActionArguments(player: Player, action: Action, args: any) {
    const argumentParser = actionArgumentParsers(this.game)[action];
    try {
      return argumentParser(args);
    } catch (err: any) {
      this.callbacks.onArgumentParseError.forEach((callback) => callback(err, this, action, player, args));
      throw err;
    }
  }
}

export default GameInterface;
