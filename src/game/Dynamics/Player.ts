import { shuffle } from "lodash";

import GameplayError from "./GameplayError";
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

  public has(resources: ResourceBundle): boolean {
    return this.resources.hasAll(resources);
  }

  public recieve(resources: ResourceBundle): void {
    this.resources.addAll(resources);
  }

  public giveAway(resources: ResourceBundle): void {
    if (this.has(resources)) {
      this.resources.subtractAll(resources);
    } else {
      throw new GameplayError(`${this.name} doesn't have enough resources`);
    }
  }

  public stealAll(resource: Resource): ResourceBundle {
    const quantity = this.resources.amountOf(resource);
    this.resources.subtract(resource, quantity);
    return new ResourceBundle({ [resource]: quantity });
  }

  public stealRandomResource(): ResourceBundle {
    const availableResources: Resource[] = [];
    this.resources.forEach((resource, quantity) => {
      availableResources.push(
        ...Array.from({ length: quantity }, () => resource)
      );
    });
    return new ResourceBundle({ [shuffle(availableResources)[0]]: 1 });
  }

  exchange(
    otherPlayer: Player,
    resourcesGiven: ResourceBundle,
    resourcesTaken: ResourceBundle
  ) {
    if (otherPlayer.is(this)) {
      throw new GameplayError(
        `${otherPlayer.getName()} can't exchange resources with themselves`
      );
    } else if (resourcesGiven.isEmpty()) {
      throw new GameplayError(
        `${otherPlayer.getName()} can't give away resources without getting anything in return`
      );
    } else if (resourcesTaken.isEmpty()) {
      throw new GameplayError(
        `${this.getName()} can't give away resources without getting anything in return`
      );
    } else if (!this.has(resourcesGiven)) {
      throw new GameplayError(
        `${this.getName()} doesn't have enough resources to perform the exchange`
      );
    } else if (!otherPlayer.has(resourcesTaken)) {
      throw new GameplayError(
        `${otherPlayer.getName()} doesn't have enough resources to perform the exchange`
      );
    } else {
      this.giveAway(resourcesGiven);
      otherPlayer.recieve(resourcesGiven);
      otherPlayer.giveAway(resourcesTaken);
      this.recieve(resourcesTaken);
    }
  }

  public trade(resourceTaken: Resource, resourceGiven: Resource) {
    const payment = new ResourceBundle({
      [resourceGiven]: this.exchangeRate(resourceGiven),
    });
    if (this.has(payment)) {
      this.giveAway(payment);
      this.recieve(new ResourceBundle({ [resourceTaken]: 1 }));
    } else {
      throw new GameplayError(
        `${this.getName()} doesn't have enough resources to perform the exchange`
      );
    }
  }

  public exchangeRate(resource: Resource): number {
    return Math.min(
      4,
      ...this.controlledPorts
        .filter((port) => port.accepts(resource))
        .map((port) => port.getExchangeRate())
    );
  }

  public buildSettlement(
    cornerId: number,
    forFree = false,
    requireConnection = true
  ): Settlement {
    if (!forFree && !this.has(Settlement.cost())) {
      throw new GameplayError(
        `${this.name} doesn't have enough resources to build a Settlement`
      );
    }

    const settlement = this.game
      .getBoard()
      .buildSettlement(this, cornerId, requireConnection);
    this.constructions.push(settlement);
    if (settlement.hasPort()) {
      this.controlledPorts.push(settlement.getPort()!);
    }
    if (!forFree) {
      this.giveAway(Settlement.cost());
    }
    return settlement;
  }

  public canBuildRoad(corners: [number, number]) {
    return this.game.getBoard().canBuildRoad(this, corners);
  }

  public buildRoad(
    [corner1Id, corner2Id]: [number, number],
    forFree = false
  ): Road {
    if (!forFree && !this.has(Road.cost())) {
      throw new GameplayError(
        `${this.name} doesn't have enough resources to build a Road`
      );
    }
    const road = this.game.getBoard().buildRoad(this, [corner1Id, corner2Id]);
    this.roads.push(road);
    if (!forFree) {
      this.giveAway(Road.cost());
    }
    return road;
  }

  public buildCity(cornerId: number): City {
    if (!this.has(City.cost())) {
      throw new GameplayError(
        `${this.name} doesn't have enough resources to build a City`
      );
    }

    const city = this.game.getBoard().buildCity(this, cornerId);
    const index = this.constructions.findIndex(
      (construction) =>
        construction.isSettlement() && construction.getCorner().is(cornerId)
    );
    this.constructions.splice(index, 1, city);
    this.giveAway(City.cost());
    return city;
  }

  public buyDevelopmentCard(): DevelopmentCard {
    if (!this.has(DevelopmentCard.cost())) {
      throw new GameplayError(
        `${this.name} doesn't have enough resources to buy a Development Card`
      );
    }
    const card = this.game.drawDevelopmentCard();
    this.developmentCards.push(card);
    card.giveTo(this);
    return card;
  }

  public playDevelopmentCard(card: DevelopmentCard): void {
    if (card.getHolder()?.is(this)) {
      if (!card.isPlayable()) {
        throw new GameplayError(
          `At least one turn must pass before playing the Development Card ${card.getId()}`
        );
      } else if (card.wasPlayed()) {
        throw new GameplayError(
          `The Development Card ${card.getId()} has already been played`
        );
      } else {
        card.play();
      }
    } else {
      throw new GameplayError(
        `${this.name} doesn't have the Development Card ${card.getId()}`
      );
    }
  }

  public markDevelopmentCardsAsPlayable() {
    this.developmentCards.forEach((card) => card.markAsPlayable());
  }

  public getResources(): ResourceBundle {
    return this.resources;
  }

  public getCollectibleResources(number: number): ResourceBundle {
    return ResourceBundle.combine(
      this.constructions.map((construction) =>
        construction.getCollectibleResources(number)
      )
    );
  }

  public getLongestRoute(): Road[] {
    // TODO: Actually compute the longest road
    return this.roads;
  }

  public getKnightCount(): number {
    return this.developmentCards.filter(
      (card) => card.isKnight() && card.wasPlayed()
    ).length;
  }

  public getResourcesCount(): number {
    return this.resources.total();
  }

  public addAchievementToken(token: AchievementToken) {
    this.achievementTokens.push(token);
  }

  public removeAchievementToken(token: AchievementToken) {
    const index = this.achievementTokens.findIndex((otherToken) =>
      otherToken.is(token)
    );
    if (index >= 0) {
      this.achievementTokens.splice(index, 1);
    } else {
      throw Error(
        `${this.name} doesn't have the Achivement Token ${token.getId()}`
      );
    }
  }

  public victoryPoints(): number {
    const constructionPoints = this.constructions
      .map((construction) => construction.victoryPoints())
      .reduce((x, y) => x + y, 0);
    const developmentCardPoints = this.developmentCards
      .map((card) => card.victoryPoints())
      .reduce((x, y) => x + y, 0);
    const achievementTokenPoints = this.achievementTokens
      .map((achievementToken) => achievementToken.victoryPoints())
      .reduce((x, y) => x + y, 0);
    return constructionPoints + developmentCardPoints + achievementTokenPoints;
  }
}

export default Player;
