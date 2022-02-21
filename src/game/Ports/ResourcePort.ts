import Port from "./Port";
import Resource from "../Resources/Resource";

export class ResourcePort extends Port {
  constructor(exchangeRate: number, private resource: Resource) {
    super(exchangeRate);
  }

  public accepts(resource: Resource): boolean {
    return resource === this.resource;
  }
}

export default ResourcePort;
