import { shuffle } from "lodash";

import Game from "./Game";
import AchievementToken from "../AchievementTokens/AchievementToken";
import City from "../Constructions/City";
import Construction from "../Constructions/Construction";
import Road from "../Constructions/Road";
import Settlement from "../Constructions/Settlement";
import DevelopmentCard from "../DevelopmentCards/DevelopmentCard";
import Resource from "../Resources/Resource";
import ResourceBundle from "../Resources/ResourceBundle";
import Port from "../Ports/Port";
import { Checker, CheckResult } from "../Checks/Checks";
import Corner from "../Board/Corner";
import Turn from "../Turns/Turn";

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
        check: this.has(resources),
        elseReason: "NOT_ENOUGH_RESOURCES",
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
    return new ResourceBundle({ [shuffle(availableResources)[0]]: 1 });
  }

  public canExchange(otherPlayer: Player, resourcesGiven: ResourceBundle, resourcesTaken: ResourceBundle): CheckResult {
    return new Checker()
      .addChecks([
        {
          check: !otherPlayer.is(this),
          elseReason: "SAME_ORIGIN_AND_DESTINY_PLAYER",
        },
        {
          check: !resourcesGiven.isEmpty(),
          elseReason: "NO_RESOURCES_GIVEN",
        },
        {
          check: !resourcesTaken.isEmpty(),
          elseReason: "NO_RESOURCES_TAKEN",
        },
        {
          check: this.has(resourcesGiven),
          elseReason: "NOT_ENOUGH_RESOURCES",
        },
        {
          check: otherPlayer.has(resourcesTaken),
          elseReason: "DESTINY_PLAYER_NOT_ENOUGH_RESOURCES",
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
        check: this.resources.has(resourceGiven, this.exchangeRate(resourceGiven)),
        elseReason: "NOT_ENOUGH_RESOURCES",
      })
      .run();
  }

  public trade(resourceTaken: Resource, resourceGiven: Resource): void {
    this.giveAway(
      new ResourceBundle({
        [resourceGiven]: this.exchangeRate(resourceGiven),
      })
    );
    this.recieve(new ResourceBundle({ [resourceTaken]: 1 }));
  }

  public exchangeRate(resource: Resource): number {
    return Math.min(
      4,
      ...this.controlledPorts.filter((port) => port.accepts(resource)).map((port) => port.getExchangeRate())
    );
  }

  // Constructions

  public canBuildRoad(corners: [Corner, Corner], forFree: boolean): CheckResult {
    const checker = new Checker();
    if (!forFree) {
      checker.addCheck({
        check: this.has(Road.cost()),
        elseReason: "NOT_ENOUGH_RESOURCES",
      });
    }
    return checker.addCheck(this.game.getBoard().canBuildRoad(this, corners)).run();
  }

  public buildRoad(corners: [Corner, Corner], forFree = false): Road {
    const road = this.game.getBoard().buildRoad(this, corners);
    this.roads.push(road);
    if (!forFree) {
      this.giveAway(Road.cost());
    }
    return road;
  }

  public canBuildSettlement(corner: Corner, forFree: boolean, requireConnection: boolean): CheckResult {
    const checker = new Checker();
    if (!forFree) {
      checker.addCheck({
        check: this.has(Settlement.cost()),
        elseReason: "NOT_ENOUGH_RESOURCES",
      });
    }
    return checker.addCheck(this.game.getBoard().canBuildSettlement(this, corner, requireConnection)).run();
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

  public canBuildCity(corner: Corner): CheckResult {
    return new Checker()
      .addCheck({
        check: this.has(City.cost()),
        elseReason: "NOT_ENOUGH_RESOURCES",
      })
      .addCheck(this.game.getBoard().canBuildCity(this, corner))
      .run();
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
          check: this.has(DevelopmentCard.cost()),
          elseReason: "NOT_ENOUGH_RESOURCES",
        },
        this.game.canDrawDevelopmentCard(),
      ])
      .run();
  }

  public buyDevelopmentCard(turn: Turn): DevelopmentCard {
    const card = this.game.drawDevelopmentCard();
    this.developmentCards.push(card);
    card.giveTo(this, turn);
    return card;
  }

  public canPlayDevelopmentCard(card: DevelopmentCard): CheckResult {
    return new Checker()
      .addChecks([
        {
          check: card.getHolder()?.is(this) ?? false,
          elseReason: "CARD_NOT_OWNED_BY_PLAYER",
        },
        card.canBePlayed(),
      ])
      .run();
  }

  public playDevelopmentCard(card: DevelopmentCard): void {
    card.play();
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
    // TODO: Actually compute the longest road
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
      throw Error(`${this.name} doesn't have the Achivement Token ${token.getId()}`);
    }
  }

  public victoryPoints(): number {
    const constructionPoints = this.constructions
      .map((construction) => construction.victoryPoints())
      .reduce((x, y) => x + y, 0);
    const developmentCardPoints = this.developmentCards.map((card) => card.victoryPoints()).reduce((x, y) => x + y, 0);
    const achievementTokenPoints = this.achievementTokens
      .map((achievementToken) => achievementToken.victoryPoints())
      .reduce((x, y) => x + y, 0);
    return constructionPoints + developmentCardPoints + achievementTokenPoints;
  }
}

export default Player;
