import Port from "./Port";

export class OpenPort extends Port {
  public accepts(): boolean {
    return true;
  }
}

export default OpenPort;
