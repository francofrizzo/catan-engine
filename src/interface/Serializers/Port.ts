import Port from "../../game/Ports/Port";

export const serializePort = (port: Port) => {
  return {
    exchangeRate: port.getExchangeRate(),
    accepts: port.acceptedResources(),
  };
};
