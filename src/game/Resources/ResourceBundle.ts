import Resource from "./Resource";

export class ResourceBundle {
  private resources: Record<Resource, number> = {
    [Resource.Brick]: 0,
    [Resource.Grain]: 0,
    [Resource.Lumber]: 0,
    [Resource.Ore]: 0,
    [Resource.Wool]: 0,
  };

  constructor(resources?: Partial<Record<Resource, number>>) {
    if (resources) {
      (Object.keys(resources) as Resource[]).forEach((resource) => {
        this.resources[resource] = resources[resource] ?? 0;
      });
    }
  }

  public amountOf(resource: Resource): number {
    return this.resources[resource];
  }

  public addAll(otherBundle: ResourceBundle): this {
    otherBundle.forEach((resource, quantity) => {
      this.add(resource, quantity);
    });
    return this;
  }

  public subtractAll(otherBundle: ResourceBundle): this {
    if (this.hasAll(otherBundle)) {
      otherBundle.forEach((resource, quantity) => {
        this.subtract(resource, quantity);
      });
      return this;
    } else {
      throw Error("There are not enough resources in this bundle");
    }
  }

  public hasAll(otherBundle: ResourceBundle): boolean {
    return otherBundle.every((resource, quantity) =>
      this.has(resource, quantity)
    );
  }

  public isEmpty() {
    return this.every((resource, quantity) => quantity === 0);
  }

  public add(resource: Resource, quantity = 1): this {
    this.resources[resource] += quantity;
    return this;
  }

  public has(resource: Resource, quantity = 1): boolean {
    return this.resources[resource] >= quantity;
  }

  public subtract(resource: Resource, quantity = 1): this {
    if (this.has(resource, quantity)) {
      this.resources[resource] -= quantity;
      return this;
    } else {
      throw Error(`There is not enough ${resource} in this bundle`);
    }
  }

  public multiply(factor: number): this {
    (Object.keys(this.resources) as Resource[]).forEach((resource) => {
      this.resources[resource] = this.resources[resource] * factor;
    });
    return this;
  }

  public map<T>(mapFunction: (resource: Resource, quantity: number) => T): T[] {
    return (Object.keys(this.resources) as Resource[]).map((resource) =>
      mapFunction(resource, this.resources[resource])
    );
  }

  public forEach(
    forEachFunction: (resource: Resource, quantity: number) => void
  ): void {
    return (Object.keys(this.resources) as Resource[]).forEach((resource) =>
      forEachFunction(resource, this.resources[resource])
    );
  }

  public some(
    predicate: (resource: Resource, quantity: number) => boolean
  ): boolean {
    return (Object.keys(this.resources) as Resource[]).some((resource) =>
      predicate(resource, this.resources[resource])
    );
  }

  public every(
    predicate: (resource: Resource, quantity: number) => boolean
  ): boolean {
    return (Object.keys(this.resources) as Resource[]).every((resource) =>
      predicate(resource, this.resources[resource])
    );
  }

  public total(): number {
    return this.map((_, quantity) => quantity).reduce((x, y) => x + y, 0);
  }

  public static combine(resourceBundles: ResourceBundle[]): ResourceBundle {
    const combinedBundles = new ResourceBundle();
    resourceBundles.forEach((bundle) => combinedBundles.addAll(bundle));
    return combinedBundles;
  }
}

export default ResourceBundle;
