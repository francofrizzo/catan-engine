import Port from "./Port";
import Resource, { allResources } from "../Resources/Resource";

export class OpenPort extends Port {
  public accepts(): boolean {
    return true;
  }

  public acceptedResources(): Resource[] {
    return allResources;
  }
}

export default OpenPort;
