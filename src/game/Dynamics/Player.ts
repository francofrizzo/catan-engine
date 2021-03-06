import { shuffle } from "lodash";

import Game from "./Game";
import AchievementToken from "../AchievementTokens/AchievementToken";
import Checker from "../Checks/Checker";
import { CheckResult } from "../Checks/Checks";
import { CheckFailedReason } from "../Checks/FailedChecks";
import City from "../Constructions/City";
import Construction from "../Constructions/Construction";
import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";
import Port from "../Ports/Port";
import Corner from "../Board/Corner";
import Turn from "../Turns/Turn";
import { GameplayError, GameplayErrorReason } from "../GameplayError/GameplayError";

export class Player {
  private resources: ResourceBundle = new ResourceBundle();
  private constructions: Construction[] = [];
  private roads: Road[] = [];
  private controlledPorts: Port[] = [];
  private developmentCards: DevelopmentCard[] = [];
  private achievementTokens: AchievementToken[] = [];

  constructor(private game: Game, private id: number, private name: string) {}

  public is(player: Player): boolean;
  public is(id: number): boolean;
  public is(playerOrId: Player | number): boolean {
    if (typeof playerOrId === "number") {
      return this.id === playerOrId;
    } else {
      return this.id === playerOrId.id;
    }
  }

  public getId(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  // Resources

  public has(resources: ResourceBundle): boolean {
    return this.resources.hasAll(resources);
  }

  public recieve(resources: ResourceBundle): void {
    this.resources.addAll(resources);
  }

  public canGiveAway(resources: ResourceBundle): CheckResult {
    return new Checker()
      .addCheck({
        check: () => this.has(resources),
        elseReason: CheckFailedReason.NotEnoughResources,
      })
      .run();
  }

  public giveAway(resources: ResourceBundle): ResourceBundle {
    this.resources.subtractAll(resources);
    return resources;
  }

  public giveAwayAll(resource: Resource): ResourceBundle {
    const quantity = this.resources.amountOf(resource);
    this.resources.subtract(resource, quantity);
    return new ResourceBundle({ [resource]: quantity });
  }

  public giveAwayRandomResource(): ResourceBundle {
    const availableResources: Resource[] = [];
    this.resources.forEach((resource, quantity) => {
      availableResources.push(...Array.from({ length: quantity }, () => resource));
    });
    const resourceToGiveAway = shuffle(availableResources)[0];
    this.resources.subtract(resourceToGiveAway, 1);
    return new ResourceBundle({ [resourceToGiveAway]: 1 });
  }

  public canExchange(otherPlayer: Player, resourcesGiven: ResourceBundle, resourcesTaken: ResourceBundle): CheckResult {
    return new Checker()
      .addChecks([
        {
          check: () => !otherPlayer.is(this),
          elseReason: CheckFailedReason.SameOriginAndDestinyPlayer,
        },
        {
          check: () => !resourcesGiven.isEmpty(),
          elseReason: CheckFailedReason.NoResourcesGiven,
        },
        {
          check: () => !resourcesTaken.isEmpty(),
          elseReason: CheckFailedReason.NoResourcesTaken,
        },
        {
          check: () => this.has(resourcesGiven),
          elseReason: CheckFailedReason.NotEnoughResources,
        },
        {
          check: () => otherPlayer.has(resourcesTaken),
          elseReason: CheckFailedReason.DestinyPlayerNotEnoughResources,
        },
      ])
      .run();
  }

  public exchange(otherPlayer: Player, resourcesGiven: ResourceBundle, resourcesTaken: ResourceBundle): void {
    this.giveAway(resourcesGiven);
    otherPlayer.recieve(resourcesGiven);
    otherPlayer.giveAway(resourcesTaken);
    this.recieve(resourcesTaken);
  }

  public canTrade(resourceTaken: Resource, resourceGiven: Resource): CheckResult {
    return new Checker()
      .addCheck({
        check: () => this.resources.has(resourceGiven, this.getExchangeRate(resourceGiven)),
        elseReason: CheckFailedReason.NotEnoughResources,
      })
      .run();
  }

  public trade(resourceTaken: Resource, resourceGiven: Resource): void {
    this.giveAway(
      new ResourceBundle({
        [resourceGiven]: this.getExchangeRate(resourceGiven),
      })
    );
    this.recieve(new ResourceBundle({ [resourceTaken]: 1 }));
  }

  public getExchangeRate(resource: Resource): number {
    return Math.min(
      4,
      ...this.controlledPorts.filter((port) => port.accepts(resource)).map((port) => port.getExchangeRate())
    );
  }

  public getExchangeRates(): Record<Resource, number> {
    return {
      [Resource.Brick]: this.getExchangeRate(Resource.Brick),
      [Resource.Grain]: this.getExchangeRate(Resource.Grain),
      [Resource.Lumber]: this.getExchangeRate(Resource.Lumber),
      [Resource.Ore]: this.getExchangeRate(Resource.Ore),
      [Resource.Wool]: this.getExchangeRate(Resource.Wool),
    };
  }

  // Constructions

  public canBuildRoad(corners: [Corner, Corner] | undefined, forFree: boolean): CheckResult {
    const checker = new Checker();
    if (!forFree) {
      checker.addCheck({
        check: () => this.has(Road.cost()),
        elseReason: CheckFailedReason.NotEnoughResources,
      });
    }
    if (corners !== undefined) {
      checker.addCheck(() => this.game.getBoard().canBuildRoad(this, corners));
    }
    return checker.run();
  }

  public buildRoad(corners: [Corner, Corner], forFree = false): Road {
    const road = this.game.getBoard().buildRoad(this, corners);
    this.roads.push(road);
    if (!forFree) {
      this.giveAway(Road.cost());
    }
    return road;
  }

  public canBuildSettlement(corner: Corner | undefined, forFree: boolean, requireConnection: boolean): CheckResult {
    const checker = new Checker();
    if (!forFree) {
      checker.addCheck({
        check: () => this.has(Settlement.cost()),
        elseReason: CheckFailedReason.NotEnoughResources,
      });
    }
    if (corner !== undefined) {
      checker.addCheck(() => this.game.getBoard().canBuildSettlement(this, corner, requireConnection));
    }
    return checker.run();
  }

  public buildSettlement(corner: Corner, forFree = false): Settlement {
    const settlement = this.game.getBoard().buildSettlement(this, corner);
    this.constructions.push(settlement);
    if (settlement.hasPort()) {
      this.controlledPorts.push(settlement.getPort()!);
    }
    if (!forFree) {
      this.giveAway(Settlement.cost());
    }
    return settlement;
  }

  public canBuildCity(corner: Corner | undefined): CheckResult {
    const checker = new Checker().addCheck({
      check: () => this.has(City.cost()),
      elseReason: CheckFailedReason.NotEnoughResources,
    });
    if (corner !== undefined) {
      checker.addCheck(() => this.game.getBoard().canBuildCity(this, corner));
    }
    return checker.run();
  }

  public buildCity(corner: Corner): City {
    const city = this.game.getBoard().buildCity(this, corner);
    const index = this.constructions.findIndex(
      (construction) => construction.isSettlement() && construction.getCorner().is(corner)
    );
    this.constructions.splice(index, 1, city);
    this.giveAway(City.cost());
    return city;
  }

  // Development cards

  public canBuyDevelopmentCard(): CheckResult {
    return new Checker()
      .addChecks([
        {
          check: () => this.has(DevelopmentCard.cost()),
          elseReason: CheckFailedReason.NotEnoughResources,
        },
        () => this.game.canDrawDevelopmentCard(),
      ])
      .run();
  }

  public buyDevelopmentCard(turn: Turn): DevelopmentCard {
    const card = this.game.drawDevelopmentCard();
    this.developmentCards.push(card);
    card.giveTo(this, turn);
    this.giveAway(DevelopmentCard.cost());
    return card;
  }

  public canPlayDevelopmentCard(card: DevelopmentCard): CheckResult {
    return new Checker()
      .addChecks([
        {
          check: () => card.getHolder()?.is(this) ?? false,
          elseReason: CheckFailedReason.CardNotOwnedByPlayer,
        },
        () => card.canBePlayed(),
      ])
      .run();
  }

  public playDevelopmentCard(card: DevelopmentCard): void {
    card.play();
  }

  public getDevelopmentCards(): DevelopmentCard[] {
    return this.developmentCards;
  }

  public getPlayedDevelopmentCards(): DevelopmentCard[] {
    return this.developmentCards.filter((card) => card.wasPlayed());
  }

  public getResources(): ResourceBundle {
    return this.resources;
  }

  public getCollectibleResources(number: number): ResourceBundle {
    return ResourceBundle.combine(
      this.constructions.map((construction) => construction.getCollectibleResources(number))
    );
  }

  public getLongestRoute(): Road[] {
    // TODO: Actually compute the longest route
    return this.roads;
  }

  public getKnightCount(): number {
    return this.developmentCards.filter((card) => card.isKnight() && card.wasPlayed()).length;
  }

  public getResourcesCount(): number {
    return this.resources.total();
  }

  public addAchievementToken(token: AchievementToken) {
    this.achievementTokens.push(token);
  }

  public removeAchievementToken(token: AchievementToken) {
    const index = this.achievementTokens.findIndex((otherToken) => otherToken.is(token));
    if (index >= 0) {
      this.achievementTokens.splice(index, 1);
    } else {
      throw new GameplayError(GameplayErrorReason.AchievementTokenNotOwnedByPlayer);
    }
  }

  public getAchievementTokens(): AchievementToken[] {
    return this.achievementTokens;
  }

  public getVisibleVictoryPoints(): number {
    const constructionPoints = this.constructions
      .map((construction) => construction.victoryPoints())
      .reduce((x, y) => x + y, 0);
    const achievementTokenPoints = this.achievementTokens
      .map((achievementToken) => achievementToken.victoryPoints())
      .reduce((x, y) => x + y, 0);
    return constructionPoints + achievementTokenPoints;
  }

  public getVictoryPoints(): number {
    const developmentCardPoints = this.developmentCards.map((card) => card.victoryPoints()).reduce((x, y) => x + y, 0);
    return this.getVisibleVictoryPoints() + developmentCardPoints;
  }
}

export default Player;
