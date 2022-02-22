import Resource from "../Resources/Resource";

export abstract class Port {
  constructor(private exchangeRate: number) {}

  public getExchangeRate(): number {
    return this.exchangeRate;
  }

  public abstract accepts(resource: Resource): boolean;

  public abstract acceptedResources(): Resource[];
}

export default Port;
