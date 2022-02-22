import ResourceBundle from "../../game/Resources/ResourceBundle";

export const serializeResources = (resourceBundle: ResourceBundle) => {
  return Object.fromEntries(resourceBundle.map((resource, quantity) => [resource, quantity]));
};
